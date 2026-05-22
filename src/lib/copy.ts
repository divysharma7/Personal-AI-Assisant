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
    sectionFavorites: "Favorites",
    sectionMeetings: "Meetings",
    sectionLists: "Lists",
    sectionTools: "Tools",
    browseAll: "Browse all",
    newListTooltip: "New list",
    upgradeCta: "Upgrade",
    fab: {
      newTask: "New task",
      newTaskShortcut: "\u2303N",
      newList: "New list",
      newListShortcut: "\u21E7\u2318N",
      talkMode: "Talk mode",
      talkModeShortcut: "\u2303T",
      newMeeting: "New meeting",
      newMeetingShortcut: "\u21E7\u2318M",
    },
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
    emptyState: "You're all caught up. Take a break.",
  },
  tasks: {
    title: "Tasks",
    filters: { forMe: "Tasks for me", upcoming: "Upcoming", done: "Done" },
    viewModes: ["List", "Board", "Matrix"] as const,
    sortDefault: "Creation date",
    newTaskCta: "+ New task",
    board: {
      backlog: "Backlog",
      todo: "To Do",
      inProgress: "In Progress",
      done: "Done",
      dropped: "Dropped",
    },
    matrix: {
      urgentImportant: "Urgent + Important",
      notUrgentImportant: "Not Urgent + Important",
      urgentNotImportant: "Urgent + Not Important",
      neither: "Not Urgent + Not Important",
    },
    emptyStates: {
      forMe: "No tasks assigned to you. Pull a few from Inbox?",
      upcoming: "Nothing on the horizon.",
      done: "No completed tasks in the last 30 days.",
    },
    kanban: {
      byTime: 'By Time',
      bySection: 'By Section',
      overdue: 'Overdue',
      today: 'Today',
      tomorrow: 'Tomorrow',
      later: 'Later',
      noDate: 'No Date',
      postpone: 'Postpone',
      newSection: '+ New section',
      rename: 'Rename',
      addLeft: 'Add section to left',
      addRight: 'Add section to right',
      deleteSection: 'Delete section',
      completed: 'Completed',
      emptyColumn: 'No tasks',
      addTask: '+ Add task',
      viewOptions: 'View Options',
      kanbanSize: 'Kanban Size',
      showInputBox: 'Show Input Box',
      sizeSmall: 'Small',
      sizeMedium: 'Medium',
      sizeLarge: 'Large',
      taskActivities: 'Task Activities',
    },
    workflow: {
      backToTasks: 'Back to Tasks',
      manageColumns: 'Manage Columns',
      viewOptions: 'View Options',
      noTasks: 'Drop tasks here',
      notFound: 'Workflow not found',
      loading: 'Loading workflow...',
    },
  },

  // ───────── Updates (replaces Messages) ─────────
  updates: {
    title: "Updates",
    tipBanner: "View updates from tasks you've created, been assigned, or been mentioned",
    tabs: { all: "All", tasks: "Tasks", messages: "Messages", lists: "Lists" },
    emptyStates: {
      all: "No updates yet. Activity from your tasks, messages, and lists will show up here.",
      tasks: "No task updates yet.",
      messages: "No message updates yet.",
      lists: "No list updates yet.",
    },
  },

  // ───────── Messages (legacy) ─────────
  messages: {
    title: "Messages",
    tipBanner: "Send and receive messages with your team — keep the conversation going.",
    emptyState: "No messages yet",
  },

  // ───────── Lists Directory ─────────
  listsDirectory: {
    title: "Lists",
    tipBanner: "Easily access all your lists. Star them to pin to your sidebar.",
    newListCta: "+ New list",
    newMeetingCta: "+ Meeting note",
    filters: { all: "All", shared: "Shared", private: "Private", meetings: "Meetings" },
    searchPlaceholder: "Search lists...",
    emptyState: "No lists match your filter.",
    privateLabel: "Private",
    sharedLabel: "Shared",
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
    getSetUp: "Get set up",
    firstTodoIntro: "Ready to dig in? Here's your very first to-do list.",
    openTaskHint: "To open this task, click on the task row.",
    starterTasks: [
      "Watch Welcome Video",
      "Create your first list",
      "Create your team",
      "Connect your first integration",
      "Stay connected across all your devices",
      "Share your feedback with the LAIF team",
    ],
  },

  // ───────── Settings ─────────
  settings: {
    title: "Settings",
    signOut: "Sign out",
    tabs: {
      profile: "Profile",
      features: "Features",
      subscriptions: "Subscriptions",
      integrations: "Integrations",
      notifications: "Notifications",
      labels: "Labels",
      collaborators: "Collaborators",
    },
    profile: {
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      deleteAccount: "Delete account",
      deleteWarning: "This action cannot be undone.",
      deleteConfirmCheckbox: "I understand this will permanently delete my account and all data.",
      deleteCancelCta: "Cancel",
      deleteConfirmCta: "Delete account",
    },
    features: {
      themeLabel: "Appearance",
      themeOptions: [
        "System", "Light", "Dark", "Blackout", "Ocean", "Berry", "Forest",
        "Sunset", "Blossom", "Blue & White", "Black & Yellow", "Blue & Red", "Red & White",
      ] as const,
      soundsLabel: "Sounds",
      soundsToggle: "Enable sound effects",
      talkLabel: "Talk",
      talkLanguage: "Language",
      talkComingSoon: "Coming soon",
      meetingNotesLabel: "Meeting notes",
      meetingNotesToggle: "Show meetings at the top of the Today view",
    },
    subscriptions: {
      planName: "Personal Free",
      planFeatures: [
        "5 shared lists",
        "5 collaborators per list",
        "500MB storage",
      ],
      upgradeCta: "Upgrade to Pro",
    },
    integrations: {
      free: [
        { name: "Gmail", description: "Import emails as tasks" },
        { name: "Google Calendar", description: "Sync your calendar events" },
        { name: "Microsoft To Do", description: "Import your Microsoft tasks" },
        { name: "Email forwarding", description: "Forward emails to create tasks" },
      ],
      pro: [
        { name: "Slack", description: "Create tasks from Slack messages" },
        { name: "GitHub", description: "Link issues and pull requests" },
        { name: "Linear", description: "Sync issues bidirectionally" },
        { name: "Figma", description: "Attach design files to tasks" },
      ],
      connectCta: "Connect",
      proBadge: "Pro",
    },
    notifications: {
      comingSoon: "Notification preferences coming soon",
    },
    labels: {
      title: "Labels",
      createPlaceholder: "New label name...",
      createCta: "Create",
      deleteCta: "Delete",
      emptyState: "No labels yet. Create one above.",
    },
    collaborators: {
      comingSoon: "Manage collaborators from individual lists",
    },
  },

  // ───────── Calendar Integration ─────────
  calendar: {
    setupTitle: "Google Calendar",
    setupSteps: [
      "Connect your Google account",
      "Sign in and allow calendar access",
      "Choose which calendar to use",
      "Tasks will appear as events",
    ],
    connectCta: "Connect Google Calendar",
    connectedLabel: "Connected to Google Calendar",
    calendarLabel: "Calendar",
    primaryCalendar: "Primary",
    autoSyncLabel: "Auto-sync",
    disconnectCta: "Disconnect",
    disconnectWarning: "This will remove calendar sync for all tasks.",
    syncSuccess: "Task synced to Google Calendar",
    syncRemoved: "Task removed from Google Calendar",
    syncError: "Failed to sync with Google Calendar",
    connectedBadge: "Connected",
    // Calendar View strings
    title: "Calendar",
    views: { day: "Day", week: "Week", month: "Month" },
    today: "Today",
    overdue: { title: "Overdue", dragHint: "Drag to reschedule" },
    unscheduled: { title: "Unscheduled", addTask: "Add task" },
    capacity: {
      label: "Capacity",
      overWarning: (hours: number) => `This day exceeds capacity by ${hours}h`,
      openDay: "This day is open",
    },
    contextMenu: {
      edit: "Edit",
      duplicate: "Duplicate",
      postpone: "Postpone 1 day",
      removeSchedule: "Remove schedule",
      moveToBacklog: "Move to backlog",
    },
    empty: "Drag a task from the right to plan it.",
    settings: {
      title: "Calendar",
      defaultView: "Default view",
      weekStartsOn: "Week starts on",
      timeFormat: "Time format",
      hiddenHours: "Hidden hours",
      dragToAdjust: "Drag to adjust the hidden time",
      showEarlyHours: (start: string, end: string) => `Show ${start} - ${end}`,
      showLateHours: (start: string, end: string) => `Show ${start} - ${end}`,
      hiddenRange: (start: string, end: string) => `${start} \u2013 ${end} hidden`,
      colorCoding: "Color tasks by",
      capacity: "Daily capacity",
      showCapacity: "Show capacity bar",
      showWarnings: "Show over-capacity warnings",
      showGoogle: "Show Google Calendar events",
      showHabits: "Show habits",
      showFocus: "Show focus sessions",
      currentTime: "Show current time line",
    },
  },
  timeBlock: {
    title: "Schedule time block",
    dateLabel: "Date",
    today: "Today",
    tomorrow: "Tomorrow",
    pickDate: "Pick date",
    startTimeLabel: "Start time",
    durationLabel: "Duration",
    durations: ["15m", "30m", "45m", "1h", "1.5h", "2h", "3h", "4h"] as const,
    syncCheckbox: "Sync to Google Calendar",
    saveCta: "Save",
    estimatedLabel: "Est",
    unscheduledSection: "Unscheduled",
    scheduledSection: "Scheduled",
  },
  status: {
    backlog: "Backlog",
    todo: "To Do",
    inProgress: "In Progress",
    done: "Done",
    dropped: "Dropped",
  },

  // ───────── Auth ─────────
  auth: {
    login: {
      title: "Welcome to LAIF",
      subtitle: "Your intelligent life manager",
      usernamePlaceholder: "Username",
      passwordPlaceholder: "Password",
      cta: "Sign in",
      signupPrompt: "Don't have an account?",
      signupLink: "Sign up",
    },
    signup: {
      title: "Create your account",
      subtitle: "Start managing your life with LAIF",
      namePlaceholder: "Full name",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password",
      cta: "Create account",
      loginPrompt: "Already have an account?",
      loginLink: "Log in",
    },
  },

  // ───────── Desktop only ─────────
  desktopOnly: {
    title: "LAIF is best on desktop",
    body: "For the best experience, please use a device with a screen width of 1024px or larger.",
  },

  // ───────── New task ─────────
  newTask: {
    placeholder: "New task",
    shortcutHint: "^N",
  },

  // ───────── Matrix ─────────
  matrix: {
    title: "Eisenhower Matrix",
    quadrants: {
      doFirst: { title: "Do First", subtitle: "Urgent + Important" },
      schedule: { title: "Schedule", subtitle: "Not Urgent + Important" },
      delegate: { title: "Delegate", subtitle: "Urgent + Not Important" },
      eliminate: { title: "Eliminate", subtitle: "Not Urgent + Not Important" },
    },
    addTask: "Add task",
    estHoursPlaceholder: "Est. hours",
    empty: "No tasks in this quadrant",
    summary: {
      totalEffort: "Total effort",
      doFirstEffort: "Do First",
      atRisk: "At risk",
      doneToday: "Done today",
    },
    filterNote: "Only showing tasks with priority and effort assigned",
  },

  // ───────── Habits ─────────
  habits: {
    dashboardTitle: "Habits",
    checkinTitle: "Check in",
    galleryCategories: {
      contentCreative: "Content & Creative",
      learning: "Learning",
      healthFitness: "Health & Fitness",
      networkingCareer: "Networking & Career",
    },
    streakLabels: {
      current: "Current streak",
      best: "Best streak",
      days: "days",
      day: "day",
      frozen: "Frozen",
    },
    completionStatuses: {
      achieved: "Achieved",
      unachieved: "Unachieved",
      skipped: "Skipped",
      frozen: "Frozen",
    },
    unachievedReasons: [
      "Tired",
      "Forgot",
      "No time",
      "Sick",
      "Traveling",
      "Not feeling it",
    ] as const,
    creationWizard: {
      step1Title: "Choose a habit",
      step1Body: "Pick from the gallery or create your own.",
      step2Title: "Set your goal",
      step2Body: "What does success look like?",
      step3Title: "Set your schedule",
      step3Body: "When and how often?",
      step4Title: "Set a reminder",
      step4Body: "We'll nudge you at the right time.",
      createCta: "Create habit",
      customCta: "Create custom habit",
    },
    analyticsLabels: {
      completionRate: "Completion rate",
      completionRate7d: "Last 7 days",
      completionRate30d: "Last 30 days",
      totalCompletions: "Total completions",
      dayOfWeekBreakdown: "Day of week",
      weeklyGrid: "Weekly view",
      overallRate: "Overall rate",
      longestStreak: "Longest streak",
      activeHabits: "Active habits",
    },
    emptyState: "No habits yet. Create one to get started.",
    todayEmpty: "No habits due today. Enjoy your free time.",
  },

  // ───────── Profile ─────────
  profile: {
    statisticsTitle: "Statistics",
    tabs: {
      overview: "Overview",
      tasks: "Tasks",
      focus: "Focus",
    },
    statCards: {
      tasksCompleted: "Tasks completed",
      habitsTracked: "Habits tracked",
      currentStreak: "Current streak",
      bestStreak: "Best streak",
      completionRate: "Completion rate",
      focusHours: "Focus hours",
      productiveDay: "Most productive day",
      activeDays: "Active days",
    },
  },

  // ───────── Focus ─────────
  focus: {
    title: "Focus",
    idle: {
      pickTask: "Pick a task to focus on",
      freeSession: "Free focus",
      startCta: "Start session",
    },
    active: {
      pause: "Pause",
      resume: "Resume",
      extend: "Extend",
      end: "End session",
    },
    prompt: {
      title: "Session complete",
      logged: (min: number) => `${min} minutes logged`,
      takeBreak: (min: number) => `Take a ${min}-min break`,
      extendFlow: "Extend +15 min — I'm in flow",
      extendKeep: "Extend +25 min — keep going",
      doneForNow: "Done for now",
    },
    break: {
      ready: "Ready for the next session?",
      startNext: "Start next",
    },
    themes: {
      aurora: "Aurora",
      minimal: "Minimal",
      liquid: "Liquid",
    },
    stats: {
      today: "Today",
      thisWeek: "This week",
      total: "Total",
      avg: "Average session",
      longest: "Longest session",
      streak: "Focus streak",
    },
    settings: {
      durations: "Default Durations",
      work: "Work session",
      shortBreak: "Short break",
      longBreak: "Long break",
      longBreakEvery: "Long break every",
      sessions: "sessions",
      appearance: "Appearance",
      clockTheme: "Clock theme",
      sound: "Sound",
      soundOnComplete: "Sound on complete",
      shortcuts: "Keyboard shortcuts",
      sidebar: "Show active session in sidebar",
    },
    sidebar: {
      active: "Focusing",
      return: "Return to focus",
    },
    today: {
      banner: (title: string, remaining: string) =>
        `Focusing on "${title}" — ${remaining} remaining`,
    },
  },

  // ───────── Chat ─────────
  chat: {
    title: "AI Chat",
    subtitle: "Your intelligent assistant",
    inputPlaceholder: "Ask LAIF anything...",
    thinking: "AI is thinking...",
    welcome: "Hi! I'm LAIF, your intelligent life assistant. I can help you manage tasks, check your schedule, track habits, and more. What would you like to do?",
    suggestions: [
      "What's on my schedule today?",
      "Create a task to write a blog post",
      "How are my habits going?",
      "Start a focus session",
    ],
  },

  // ───────── Folders ─────────
  folders: {
    createPlaceholder: "Folder name...",
    contextMenu: {
      rename: "Rename",
      changeIcon: "Change icon",
      moveToGroup: "Move to group...",
      delete: "Delete",
      newGroup: "New group...",
    },
    deleted: "Folder deleted",
    undo: "Undo",
    taskMoved: (folderName: string) => `Task moved to ${folderName}`,
  },

  // ───────── Habit Check-in ─────────
  habitCheckin: {
    title: "Daily Check-in",
    progress: (done: number, total: number) => `${done} of ${total} habits checked in`,
    allDone: "See you tomorrow",
    markUnachieved: "Mark as Unachieved",
    reasons: ["Tired", "Forgot", "No time", "Sick", "Traveling", "Not feeling it", "Custom"] as const,
  },

  // ───────── Streak Celebration ─────────
  streakCelebration: {
    streakTitle: (days: number) => `${days}-day streak!`,
    keepGoing: "Keep going",
  },

  // ───────── Workflows ─────────
  workflows: {
    sidebarTitle: 'Workflows',
    newWorkflow: '+ New Workflow',
    createTitle: 'Create Workflow',
    namePlaceholder: 'Workflow name...',
    templateLabel: 'Choose a template',
    labelsLabel: 'Labels',
    labelsHint: 'Tasks with these labels will appear in this workflow',
    noLabels: 'Create labels in Settings to connect tasks',
    colorLabel: 'Color',
    createCta: 'Create Workflow',
    cancelCta: 'Cancel',
    emptyState: 'No workflows yet. Create one to get started.',
    templates: {
      kanban: { label: 'Kanban', desc: 'Todo \u2192 In Progress \u2192 Done' },
      sprint: { label: 'Sprint', desc: 'Backlog \u2192 Sprint \u2192 Review \u2192 Done' },
      sales: { label: 'Sales Pipeline', desc: 'Lead \u2192 Contacted \u2192 Proposal \u2192 Closed' },
      content: { label: 'Content', desc: 'Idea \u2192 Draft \u2192 Review \u2192 Published' },
      matrix: { label: 'Matrix', desc: '2\u00D72 priority grid' },
      custom: { label: 'Custom', desc: 'Start from scratch' },
    },
  },

  // ───────── Habit Gallery ─────────
  habitGallery: {
    title: "Habit Gallery",
    addCta: "Add",
    categories: ["Content & Creative", "Learning", "Health & Fitness", "Networking & Career"] as const,
  },

  // ───────── Habit Creation Wizard ─────────
  habitCreationWizard: {
    title: "Create Habit",
    steps: [
      "Name & Icon",
      "Goal Type",
      "Target",
      "Frequency",
      "Reminder",
      "List",
    ] as const,
    stepTitles: [
      "What habit do you want to build?",
      "How will you track it?",
      "Set your target",
      "How often?",
      "When should we remind you?",
      "Which list should this live in?",
    ] as const,
    goalTypes: {
      binary: { title: "Done / not done", desc: "Simple yes or no tracking" },
      count: { title: "Reach a number", desc: "Track a measurable goal" },
    },
    frequencies: {
      daily: "Daily",
      weekly: "Weekly",
      interval: "Every N days",
    },
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const,
    back: "Back",
    next: "Next",
    create: "Create",
    namePlaceholder: "e.g. Read 30 pages",
    unitPlaceholder: "pages, min, km...",
    targetPlaceholder: "30",
    timesPerWeek: "times per week",
    everyNDays: "Every",
    days: "days",
    reminderHint: "Reminders deliver via mobile app (coming soon)",
    defaultList: "Personal Habits",
  },

  // ───────── Habit Analytics ─────────
  habitAnalytics: {
    heatmapTitle: "90-Day Activity",
    completionRates: "Completion Rates",
    dayBreakdown: "Day-of-Week Breakdown",
    topReasons: "Top Unachieved Reasons",
    insights: "Insights",
    sevenDay: "7-day",
    thirtyDay: "30-day",
    ninetyDay: "90-day",
    noData: "Not enough data for insights yet.",
  },

  // ───────── Profile / Statistics ─────────
  profileStats: {
    title: "Statistics",
    tabs: ["Overview", "Task", "Focus"] as const,
    stats: {
      tasksCompleted: "Tasks completed",
      activeHabits: "Active habits",
      focusHours: "Focus hours",
      currentStreaks: "Current streaks",
      thisWeek: "this week",
    },
    weeklyCompletion: "Weekly Completion",
    habitsSummary: "Habits Summary",
    completionRate: "Completion rate",
    mostConsistent: "Most consistent",
    leastConsistent: "Least consistent",
    atRisk: "At risk",
    atRiskDesc: "streak < 3 days",
    taskTab: {
      dailyCompleted: "Tasks Completed (Last 7 Days)",
      byPriority: "By Priority",
      byList: "By List (Top 5)",
      completionTrend: "Completion Rate Trend",
    },
    focusTab: {
      sessions: "Focus Sessions (Last 7 Days)",
      totalHours: "Total Focus Hours",
      avgSession: "Average Session Length",
      focusStreak: "Focus Streak",
      thisWeek: "This week",
      thisMonth: "This month",
      consecutiveDays: "consecutive days",
    },
    noData: "No data yet",
  },
};
