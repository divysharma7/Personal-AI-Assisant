export const copy = {
  // ───────── Onboarding ─────────
  onboarding: {
    step1: {
      title: "What should we call you?",
      body: "Let's get to know each other — tell us your first and last name.",
      placeholder: "Full name",
      cta: "Next",
    },
    step2: {
      title: "How do you want to use LAIF?",
      body: "Help us personalize your experience. Select all that apply.",
      options: ["Manage my personal tasks", "Collaborate with others", "Both"],
      cta: "Next",
    },
    step3: {
      title: "You're almost there",
      terms: "I agree to the LAIF Terms of Use and Privacy Policy.",
      emails: "I want to receive occasional emails with best practices, tips and tricks, and other news.",
      cta: "Continue",
      ctaLoading: "Creating account...",
    },
  },

  // ───────── Sidebar ─────────
  sidebar: {
    sectionRecent: "Recent",
    sectionLists: "Lists",
    sectionTools: "Tools",
    browseAll: "Browse all",
    newListTooltip: "New list",
    upgradeCta: "Upgrade",
  },

  // ───────── Inbox / Today / Tasks ─────────
  inbox: {
    title: "Inbox",
    tipBanner: "Manage all new and incoming tasks — create, move, schedule, and more",
  },
  today: {
    title: "Today",
    tipBanner: "See your schedule, track habits, and stay on top of what's due today.",
    groups: { overdue: "Overdue", today: "Today", tomorrow: "Tomorrow" },
  },
  tasks: {
    title: "Tasks",
    filters: { forMe: "Tasks for me", upcoming: "Upcoming", done: "Done" },
    viewModes: ["List", "Board", "Matrix"],
  },

  // ───────── Lists ─────────
  list: {
    untitled: "Untitled",
    privateLabel: "This list is private",
    sharedWithLabel: (names: string[]) =>
      names.length === 1 ? `Shared with ${names[0]}` : `Shared with ${names.length} people`,
    shareCta: "Share",
    emptyBlockPlaceholder: "Click here to add a task, or type '/' to choose a different content type",
    inlineNewTaskPlaceholder: "Add a task, or type '/' to choose a different content type",
    emptyParagraphPlaceholder: "Start typing, or type '/' to choose a different content type",
    overflowMenu: {
      hideCompleted: "Hide completed tasks",
      showCompleted: "Show completed tasks",
      markAllIncomplete: "Mark all incomplete",
      deleteList: "Delete list",
    },
  },

  // ───────── Task ─────────
  task: {
    completeCta: "Complete",
    completedCta: "Completed",
    leaveMessagePlaceholder: "Leave a message...",
    createdBy: (name: string, when: string) => `Created by ${name} • ${when}`,
    overflowMenu: {
      unsubscribe: "Unsubscribe",
      copyLink: "Copy link",
      markAllIncomplete: "Mark all incomplete",
      deleteTask: "Delete task",
    },
  },

  // ───────── Popovers ─────────
  popovers: {
    date: {
      today: "Today",
      tomorrow: "Tomorrow",
      nextWeek: "Next week",
      time: "Time",
      remindMe: "Remind me",
      repeat: "Repeat",
      clear: "Clear",
      done: "Done",
    },
    time: {
      noDueDate: "No due date",
      clear: "Clear",
      done: "Done",
    },
    label: {
      searchPlaceholder: "Search or create label",
    },
    assignee: {
      searchPlaceholder: "Search for name",
      pendingLabel: "Pending",
    },
    link: {
      placeholder: "Enter a URL",
      done: "Done",
    },
  },

  // ───────── Slash menu ─────────
  slashMenu: {
    items: [
      "Task",
      "Paragraph",
      "Heading 1",
      "Heading 2",
      "Heading 3",
      "Divider",
      "Bullet list",
      "Numbered list",
      "Image",
      "Attachment",
    ],
  },

  // ───────── Share modal ─────────
  share: {
    title: "Share",
    searchPlaceholder: "Search people, teams, or emails",
    inviteCta: "Invite",
    copyLinkCta: "Copy link",
    copiedConfirmation: "Copied",
    removeCta: "Remove",
    roles: { creator: "Creator", collaborator: "Collaborator" },
    toastShared: (listTitle: string, name: string) =>
      `${listTitle} has been shared with ${name}`,
    accountContext: "Personal",
  },

  // ───────── Customize list ─────────
  customizeList: {
    title: "Customize list",
    sectionEmoji: "Emoji",
    sectionImage: "Image",
    uploadCta: "Upload",
    searchUnsplashCta: "Search Unsplash",
    doneCta: "Done",
  },

  // ───────── Starter content seeded on signup ─────────
  starter: {
    gettingStartedTitle: "Getting Started",
    welcomeBody:
      "With LAIF, you can manage what matters — from daily tasks to project planning with your team — in one place. It gives you the flexibility to organize tasks, notes, images, and attachments however you want. It's not just a list. It's a LAIF list.",
    getSetUp: "\u2705 Get set up",
    firstTodoIntro: "Ready to dig in? Here's your very first to-do list.",
    openTaskHint: "\uD83D\uDCA1 To open this task, click on the task row.",
    starterTasks: [
      "Watch Welcome Video",
      "Create your first list",
      "Create your team",
      "Connect your first integration",
      "Stay connected across all your devices",
      "Share your feedback with the LAIF team",
    ],
  },
} as const
