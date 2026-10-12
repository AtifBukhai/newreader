import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { kitaboService } from '../services/kitabo';
import type {
  User, LearningPartner, Classroom, Book, AccessCode, AccessCodeBatch, Order,
  BookEntitlement, ReadingProgress, Bookmark, Highlight, AuditLogEntry,
  RegisteredDevice, ExportRecord, UserRole, UserStatus, OrderStatus, CodeStatus,
  PartnerEmail, RolePermission
} from '../types';

// ===== Book Content (static, not from backend) =====
const BOOK_CONTENT: Record<string, { chapters: { title: string; content: string }[] }> = {
  'book-1': {
    chapters: [
      { title: 'Chapter 1: What is Computer Science?', content: `Computer science is the study of computation, information, and automation.\n\nAt its core, computer science is about problem-solving. It teaches us to think systematically about complex challenges.\n\n**The Nature of Computing**\n\nComputing encompasses a broad range of activities including:\n\n- Designing algorithms that efficiently solve problems\n- Building systems that process and store information\n- Understanding the theoretical limits of what can be computed\n- Creating software that serves human needs\n\n**Key Principles**\n\nAn algorithm is a step-by-step procedure for solving a problem or accomplishing a task. This fundamental concept underlies all of computer science.\n\nComputational thinking involves breaking complex problems into smaller, manageable parts.\n\n**Why Study Computer Science?**\n\n1. Solve complex problems systematically\n2. Create technology that improves lives\n3. Understand the digital world around you\n4. Contribute to innovation across all industries\n5. Make informed decisions about technology use` },
      { title: 'Chapter 2: Data and Information', content: `Data is the foundation of all computing.\n\n**Binary Representation**\n\nAt the lowest level, computers represent all information using binary digits — bits.\n\n**Data Types**\n\nProgramming languages provide various data types:\n\n- **Integers** for whole numbers\n- **Floating-point numbers** for decimal values\n- **Characters and strings** for text\n- **Booleans** for true/false values\n- **Arrays and lists** for collections of data\n\n**Data Structures**\n\nData structures organize and store data efficiently, enabling faster access and modification.\n\nCommon data structures include:\n\n- Arrays: Contiguous memory locations\n- Linked Lists: Nodes connected by pointers\n- Stacks: Last-in, first-out (LIFO)\n- Queues: First-in, first-out (FIFO)\n- Trees: Hierarchical structures\n- Hash Tables: Key-value pairs for fast lookup` },
      { title: 'Chapter 3: Algorithms', content: `Algorithms are the heart of computer science.\n\n**What Makes a Good Algorithm?**\n\n1. **Correct** — produces the right output\n2. **Efficient** — uses resources wisely\n3. **Clear** — can be understood and verified\n4. **Finite** — terminates after bounded steps\n\n**Sorting Algorithms**\n\n- Bubble Sort: Simple but slow — O(n²)\n- Merge Sort: Consistent O(n log n)\n- Quick Sort: Fast average case\n\n**Complexity Analysis**\n\nWe measure efficiency using Big-O notation.` },
      { title: 'Chapter 4: Programming', content: `Programming transforms algorithmic thinking into working software.\n\n**Paradigms**\n\n- **Imperative**: Sequences of statements\n- **Object-Oriented**: Objects with data and behavior\n- **Functional**: Mathematical function evaluation\n\n**Testing**\n\n- Unit tests: Individual functions\n- Integration tests: Component interactions\n- End-to-end tests: Complete workflows` },
      { title: 'Chapter 5: Systems', content: `Understanding systems helps write efficient programs.\n\n**Architecture**\n\n- CPU, Memory, I/O devices, Bus system\n\n**Operating Systems**\n\n- Process management\n- Memory management\n- File systems\n- Security\n\n**Cloud Computing**\n\n- IaaS, PaaS, SaaS` },
    ]
  }
};

const DEFAULT_BOOK_CONTENT = {
  chapters: [
    { title: 'Chapter 1: Introduction', content: `Welcome to this book. This chapter provides an overview.\n\n**What You Will Learn**\n\nThis book covers essential concepts and practical applications.\n\n**How to Use This Book**\n\n- Key concepts and definitions\n- Detailed explanations with examples\n- Practice exercises\n- Summary points for review` },
    { title: 'Chapter 2: Core Concepts', content: `This chapter explores fundamental concepts.\n\n**Foundational Principles**\n\n1. The theoretical framework\n2. Practical methodologies\n3. Analytical tools\n4. Ethical considerations\n\n**Building Understanding**\n\nLearning is a progressive process.` },
    { title: 'Chapter 3: Applications', content: `Theory becomes meaningful when applied.\n\n**Practical Implementation**\n\n1. Define clear objectives\n2. Gather relevant data\n3. Apply methodologies\n4. Monitor progress\n5. Evaluate outcomes\n6. Document lessons learned` },
  ]
};

// ===== State =====
interface AppState {
  currentUser: User | null;
  users: User[];
  partners: LearningPartner[];
  partnerEmails: PartnerEmail[];
  rolePermissions: RolePermission[];
  classrooms: Classroom[];
  books: Book[];
  orders: Order[];
  codes: AccessCode[];
  batches: AccessCodeBatch[];
  entitlements: BookEntitlement[];
  devices: RegisteredDevice[];
  progress: ReadingProgress[];
  bookmarks: Bookmark[];
  highlights: Highlight[];
  auditLogs: AuditLogEntry[];
  exports: ExportRecord[];
  notifications: { id: string; message: string; type: 'success' | 'error' | 'info'; timestamp: number }[];
  isLoading: boolean;
  isDemoMode: boolean;
}

type Action =
  | { type: 'SET_STATE'; payload: Partial<AppState> }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_NOTIFICATION'; payload: { message: string; type: 'success' | 'error' | 'info' } }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'SYNC_FROM_SERVICE'; payload: Partial<AppState> }
  | { type: 'SET_LOADING'; payload: boolean };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'LOGIN':
      return { ...state, currentUser: { ...action.payload, lastLogin: new Date().toISOString() } };
    case 'LOGOUT':
      return { ...state, currentUser: null };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, { id: uuidv4(), ...action.payload, timestamp: Date.now() }] };
    case 'DISMISS_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    case 'SYNC_FROM_SERVICE':
      return { ...state, ...action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const initialState: AppState = {
  currentUser: null, users: [], partners: [], partnerEmails: [], rolePermissions: [],
  classrooms: [], books: [], orders: [], codes: [], batches: [], entitlements: [], devices: [],
  progress: [], bookmarks: [], highlights: [], auditLogs: [], exports: [],
  notifications: [], isLoading: true, isDemoMode: false,
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getBookContent: (bookId: string) => { chapters: { title: string; content: string }[] };
  // Service-backed operations
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; data?: User }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string; data?: User }>;
  signOut: () => Promise<void>;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string; data?: Order }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<{ success: boolean; error?: string }>;
  fulfillOrder: (orderId: string) => Promise<{ success: boolean; error?: string }>;
  redeemCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  revokeCode: (codeId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  createUser: (userData: { email: string; name: string; role: UserRole; partnerId?: string; status?: UserStatus }) => Promise<{ success: boolean; error?: string; data?: User }>;
  deactivateUser: (userId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  reactivateUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (userId: string) => Promise<{ success: boolean; error?: string }>;
  revokeAccess: (userId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  restoreAccess: (userId: string) => Promise<{ success: boolean; error?: string }>;
  exportCodesCSV: (orderId: string) => { success: boolean; data?: string; error?: string };
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  adminInitiatePasswordReset: (userId: string) => Promise<{ success: boolean; error?: string }>;
  addPartner: (partner: LearningPartner) => Promise<void>;
  updatePartner: (partner: LearningPartner) => Promise<void>;
  addBook: (book: Book) => Promise<void>;
  updateBook: (book: Book) => Promise<void>;
  addClassroom: (classroom: Classroom) => Promise<void>;
  addUser: (user: User) => Promise<void>;
  updateProgress: (progress: ReadingProgress) => Promise<void>;
  addBookmark: (bookmark: Bookmark) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
  addHighlight: (highlight: Highlight) => Promise<void>;
  deleteHighlight: (id: string) => Promise<void>;
  registerDevice: (device: RegisteredDevice) => Promise<void>;
  // New Super Admin operations
  addPartnerEmail: (partnerId: string, email: string) => Promise<{ success: boolean; error?: string }>;
  updatePartnerEmail: (emailId: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  verifyPartnerEmail: (emailId: string) => Promise<{ success: boolean; error?: string }>;
  deletePartnerEmail: (emailId: string) => Promise<{ success: boolean; error?: string }>;
  updateRolePermission: (permissionId: string, enabled: boolean) => Promise<{ success: boolean; error?: string }>;
  hasPermission: (role: any, module: any, action: any) => boolean;
  syncFromService: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isSyncingRef = React.useRef(false);

  const syncFromService = useCallback(() => {
    // Prevent recursive sync calls
    if (isSyncingRef.current) {
      console.log('[Kitabo Store] Sync already in progress, skipping');
      return;
    }
    
    isSyncingRef.current = true;
    console.log('[Kitabo Store] Syncing from service...');
    
    try {
      dispatch({
        type: 'SYNC_FROM_SERVICE',
        payload: {
          users: kitaboService.getUsers(),
          partners: kitaboService.getPartners(),
          partnerEmails: kitaboService.getPartnerEmails(),
          rolePermissions: kitaboService.getRolePermissions(),
          classrooms: kitaboService.getClassrooms(),
          books: kitaboService.getBooks(),
          orders: kitaboService.getOrders(),
          codes: kitaboService.getCodes(),
          batches: kitaboService.getBatches(),
          entitlements: kitaboService.getEntitlements(),
          devices: kitaboService.getDevices(),
          progress: kitaboService.getProgress(),
          bookmarks: kitaboService.getBookmarks(),
          highlights: kitaboService.getHighlights(),
          auditLogs: kitaboService.getAuditLogs(),
          exports: kitaboService.getExports(),
        }
      });
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Initialize from service
  useEffect(() => {
    console.log('[Kitabo Store] Setting up subscription...');
    console.log('[Kitabo Store] Starting initialization...');
    const init = async () => {
      try {
        console.log('[Kitabo Store] Getting current user...');
        const currentUser = await kitaboService.getCurrentUser();
        console.log('[Kitabo Store] Current user:', currentUser?.email || 'null');
        
        console.log('[Kitabo Store] Getting demo state...');
        const demoState = kitaboService.getState();
        console.log('[Kitabo Store] Demo state:', demoState ? 'available' : 'null');
        
        console.log('[Kitabo Store] Dispatching SET_STATE...');
        dispatch({
          type: 'SET_STATE',
          payload: {
            currentUser,
            users: kitaboService.getUsers(),
            partners: kitaboService.getPartners(),
            partnerEmails: kitaboService.getPartnerEmails(),
            rolePermissions: kitaboService.getRolePermissions(),
            classrooms: kitaboService.getClassrooms(),
            books: kitaboService.getBooks(),
            orders: kitaboService.getOrders(),
            codes: kitaboService.getCodes(),
            batches: kitaboService.getBatches(),
            entitlements: kitaboService.getEntitlements(),
            devices: kitaboService.getDevices(),
            progress: kitaboService.getProgress(),
            bookmarks: kitaboService.getBookmarks(),
            highlights: kitaboService.getHighlights(),
            auditLogs: kitaboService.getAuditLogs(),
            exports: kitaboService.getExports(),
            isLoading: false,
            isDemoMode: !demoState ? false : true,
          }
        });
        console.log('[Kitabo Store] Initialization complete!');
      } catch (error) {
        console.error('[Kitabo Store] Initialization error:', error);
        dispatch({ type: 'SET_STATE', payload: { isLoading: false } });
      }
    };
    init();

    // Subscribe to service changes (for demo mode)
    let subscriptionCount = 0;
    const unsubscribe = kitaboService.subscribe(() => {
      subscriptionCount++;
      console.log(`[Kitabo Store] Service state changed, syncing... (subscription #${subscriptionCount})`);
      syncFromService();
    });
    console.log('[Kitabo Store] Subscription set up');
    
    return () => {
      console.log('[Kitabo Store] Cleaning up subscription...');
      unsubscribe();
    };
  }, [syncFromService]);

  // Auto-dismiss notifications
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      state.notifications.forEach(n => {
        if (now - n.timestamp > 5000) dispatch({ type: 'DISMISS_NOTIFICATION', payload: n.id });
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.notifications]);

  const getBookContent = (bookId: string) => BOOK_CONTENT[bookId] || DEFAULT_BOOK_CONTENT;

  // Service-backed operations
  const signIn = async (email: string, password: string) => {
    console.log('[Kitabo Store] signIn called for:', email);
    const result = await kitaboService.signIn(email, password);
    if (result.success && result.data) {
      console.log('[Kitabo Store] Login successful, dispatching LOGIN');
      dispatch({ type: 'LOGIN', payload: result.data });
      // Don't call syncFromService here - the service notification will handle it
      console.log('[Kitabo Store] LOGIN dispatched, waiting for service notification');
    }
    return { success: result.success, error: result.error, data: result.data };
  };

  const signUp = async (email: string, password: string, name: string) => {
    console.log('[Kitabo Store] signUp called for:', email);
    const result = await kitaboService.signUp(email, password, name);
    if (result.success && result.data) {
      console.log('[Kitabo Store] Signup successful, dispatching LOGIN');
      dispatch({ type: 'LOGIN', payload: result.data });
      // Don't call syncFromService here - the service notification will handle it
      console.log('[Kitabo Store] LOGIN dispatched, waiting for service notification');
    }
    return { success: result.success, error: result.error, data: result.data };
  };

  const signOut = async () => {
    await kitaboService.signOut();
    dispatch({ type: 'LOGOUT' });
  };

  const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    const result = await kitaboService.createOrder(order, state.currentUser.id);
    if (result.success) syncFromService();
    return { success: result.success, error: result.error, data: result.data };
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    const result = await kitaboService.updateOrderStatus(orderId, status, state.currentUser.id);
    if (result.success) syncFromService();
    return { success: result.success, error: result.error };
  };

  const fulfillOrder = async (orderId: string) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    const result = await kitaboService.fulfillOrder(orderId, state.currentUser.id);
    if (result.success) syncFromService();
    return { success: result.success, error: result.error };
  };

  const redeemCode = async (code: string) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    const result = await kitaboService.redeemCode(code, state.currentUser.id);
    if (result.success) syncFromService();
    return { success: result.success, error: result.error };
  };

  const revokeCode = async (codeId: string, reason: string) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    const result = await kitaboService.revokeCode(codeId, reason, state.currentUser.id);
    if (result.success) syncFromService();
    return { success: result.success, error: result.error };
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    const result = await kitaboService.updateUser(userId, updates, state.currentUser.id);
    if (result.success) syncFromService();
    return { success: result.success, error: result.error };
  };

  const exportCodesCSV = (orderId: string) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    return kitaboService.exportCodesCSV(orderId, state.currentUser.id);
  };

  const requestPasswordReset = async (email: string) => {
    return kitaboService.requestPasswordReset(email);
  };

  const adminInitiatePasswordReset = async (userId: string) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    return kitaboService.adminInitiatePasswordReset(userId, state.currentUser.id);
  };

  const addPartner = async (partner: LearningPartner) => { await kitaboService.addPartner(partner); syncFromService(); };
  const updatePartner = async (partner: LearningPartner) => { await kitaboService.updatePartner(partner); syncFromService(); };
  const addBook = async (book: Book) => { await kitaboService.addBook(book); syncFromService(); };
  const updateBook = async (book: Book) => { await kitaboService.updateBook(book); syncFromService(); };
  const addClassroom = async (classroom: Classroom) => { await kitaboService.addClassroom(classroom); syncFromService(); };
  const addUser = async (user: User) => { await kitaboService.addUser(user); syncFromService(); };
  const updateProgress = async (progress: ReadingProgress) => { await kitaboService.updateProgress(progress); };
  const addBookmark = async (bookmark: Bookmark) => { await kitaboService.addBookmark(bookmark); syncFromService(); };
  const deleteBookmark = async (id: string) => { await kitaboService.deleteBookmark(id); syncFromService(); };
  const addHighlight = async (highlight: Highlight) => { await kitaboService.addHighlight(highlight); syncFromService(); };
  const deleteHighlight = async (id: string) => { await kitaboService.deleteHighlight(id); syncFromService(); };
  const registerDevice = async (device: RegisteredDevice) => { await kitaboService.registerDevice(device); syncFromService(); };

  // New Super Admin operations
  const deleteUser = async (userId: string) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    const result = await kitaboService.deleteUser(userId, state.currentUser.id);
    if (result.success) syncFromService();
    return { success: result.success, error: result.error };
  };

  const createUser = async (userData: { email: string; name: string; role: UserRole; partnerId?: string; status?: UserStatus }) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    const result = await kitaboService.createUser(userData, state.currentUser.id);
    if (result.success) syncFromService();
    return { success: result.success, error: result.error, data: result.data };
  };

  const deactivateUser = async (userId: string, reason?: string) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    const result = await kitaboService.deactivateUser(userId, state.currentUser.id, reason);
    if (result.success) syncFromService();
    return { success: result.success, error: result.error };
  };

  const reactivateUser = async (userId: string) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    const result = await kitaboService.reactivateUser(userId, state.currentUser.id);
    if (result.success) syncFromService();
    return { success: result.success, error: result.error };
  };

  const resetPassword = async (userId: string) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    const result = await kitaboService.resetPassword(userId, state.currentUser.id);
    if (result.success) syncFromService();
    return { success: result.success, error: result.error };
  };

  const revokeAccess = async (userId: string, reason?: string) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    const result = await kitaboService.revokeAccess(userId, state.currentUser.id, reason);
    if (result.success) syncFromService();
    return { success: result.success, error: result.error };
  };

  const restoreAccess = async (userId: string) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    const result = await kitaboService.restoreAccess(userId, state.currentUser.id);
    if (result.success) syncFromService();
    return { success: result.success, error: result.error };
  };

  const addPartnerEmail = async (partnerId: string, email: string) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    const result = await kitaboService.addPartnerEmail(partnerId, email, state.currentUser.id);
    if (result.success) syncFromService();
    return { success: result.success, error: result.error };
  };

  const updatePartnerEmail = async (emailId: string, updates: any) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    const result = await kitaboService.updatePartnerEmail(emailId, updates, state.currentUser.id);
    if (result.success) syncFromService();
    return { success: result.success, error: result.error };
  };

  const verifyPartnerEmail = async (emailId: string) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    const result = await kitaboService.verifyPartnerEmail(emailId, state.currentUser.id);
    if (result.success) syncFromService();
    return { success: result.success, error: result.error };
  };

  const deletePartnerEmail = async (emailId: string) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    const result = await kitaboService.deletePartnerEmail(emailId, state.currentUser.id);
    if (result.success) syncFromService();
    return { success: result.success, error: result.error };
  };

  const updateRolePermission = async (permissionId: string, enabled: boolean) => {
    if (!state.currentUser) return { success: false, error: 'Not authenticated' };
    const result = await kitaboService.updateRolePermission(permissionId, enabled, state.currentUser.id);
    if (result.success) syncFromService();
    return { success: result.success, error: result.error };
  };

  const hasPermission = (role: any, module: any, action: any) => {
    return kitaboService.hasPermission(role, module, action);
  };

  return (
    <AppContext.Provider value={{
      state, dispatch, getBookContent,
      signIn, signUp, signOut, createOrder, updateOrderStatus, fulfillOrder,
      redeemCode, revokeCode, updateUser, deleteUser, createUser, deactivateUser,
      reactivateUser, resetPassword, revokeAccess, restoreAccess, exportCodesCSV,
      requestPasswordReset, adminInitiatePasswordReset,
      addPartner, updatePartner, addBook, updateBook, addClassroom, addUser,
      updateProgress, addBookmark, deleteBookmark, addHighlight, deleteHighlight,
      registerDevice,
      addPartnerEmail, updatePartnerEmail, verifyPartnerEmail, deletePartnerEmail,
      updateRolePermission, hasPermission,
      syncFromService,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
