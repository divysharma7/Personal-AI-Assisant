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
      todo: "To Do",
      inProgress: "In Progress",
      done: "Done",
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
};
