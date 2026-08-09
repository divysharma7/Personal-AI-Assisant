import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const projectRoot = process.cwd()
const sourceRoot = join(projectRoot, 'src')
const globalsPath = join(sourceRoot, 'app', 'globals.css')
const governanceTestPath = join(sourceRoot, '__tests__', 'designSystem.test.ts')
const globalsCss = readFileSync(globalsPath, 'utf8')

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(?:css|ts|tsx)$/.test(path) ? [path] : []
  })
}

function tokenBlock(selector: ':root' | '[data-theme="light"]') {
  const start = globalsCss.indexOf(selector)
  const open = globalsCss.indexOf('{', start)
  const close = globalsCss.indexOf('\n}', open)
  const block = globalsCss.slice(open + 1, close)
  return new Map(
    Array.from(block.matchAll(/--([\w-]+):\s*(#[\da-fA-F]{6})\s*;/g)).map((match) => [match[1], match[2]]),
  )
}

function luminance(hex: string) {
  const channels = hex.slice(1).match(/.{2}/g)?.map((part) => Number.parseInt(part, 16) / 255) ?? []
  return channels.reduce((sum, channel, index) => {
    const linear = channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    return sum + linear * [0.2126, 0.7152, 0.0722][index]
  }, 0)
}

function contrast(foreground: string, background: string) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

describe('authenticated design system governance', () => {
  it('defines every referenced CSS variable', () => {
    const definitions = new Set<string>()
    const references = new Set<string>()

    for (const file of sourceFiles(sourceRoot)) {
      if (file === governanceTestPath) continue
      const source = readFileSync(file, 'utf8')
      for (const match of Array.from(source.matchAll(/--([\w-]+)\s*:/g))) definitions.add(match[1])
      for (const match of Array.from(source.matchAll(/var\(--([\w-]+)/g))) references.add(match[1])
    }

    // Habit color is supplied as a data-driven inline custom property on each row.
    const allowedDynamicTokens = new Set(['habit-color'])
    const unresolved = Array.from(references).filter((token) => !definitions.has(token) && !allowedDynamicTokens.has(token))
    expect(unresolved).toEqual([])
  })

  it('keeps core tokens owned by globals.css', () => {
    const coreTokens = /--(?:bg-(?:canvas|base|rail|pane|card|elevated|hover|active|selected)|text-(?:primary|secondary|muted|faint|disabled)|border(?:-strong)?|accent)\s*:/g
    const offenders = sourceFiles(sourceRoot)
      .filter((file) => file !== globalsPath)
      .flatMap((file) => Array.from(readFileSync(file, 'utf8').matchAll(coreTokens)).map((match) => `${relative(projectRoot, file)}:${match[0]}`))
    expect(offenders).toEqual([])
  })

  it('keeps meaningful text contrast-safe in dark and light themes', () => {
    for (const theme of [tokenBlock(':root'), tokenBlock('[data-theme="light"]')]) {
      for (const surface of ['bg-canvas', 'bg-pane', 'bg-card', 'bg-pane-2']) {
        for (const text of ['text-primary', 'text-secondary', 'text-muted', 'text-faint']) {
          expect(contrast(theme.get(text)!, theme.get(surface)!)).toBeGreaterThanOrEqual(4.5)
        }
      }
      expect(contrast(theme.get('accent-strong')!, theme.get('text-on-dark')!)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('rejects retired palette values and unsafe transition or font shortcuts', () => {
    const retired = /#(?:181824|232233|2a293b)\b/i
    const transitionAll = /transition(?:-property)?:\s*all|transition-all/
    const syntheticWeight = /font(?:-weight|Weight):\s*(?:650|690|750)/
    const offenders: string[] = []

    for (const file of sourceFiles(sourceRoot)) {
      if (file === governanceTestPath) continue
      const source = readFileSync(file, 'utf8')
      if (retired.test(source) || transitionAll.test(source) || syntheticWeight.test(source)) {
        offenders.push(relative(projectRoot, file))
      }
    }
    expect(offenders).toEqual([])
  })
})
