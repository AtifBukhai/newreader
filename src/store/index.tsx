import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  User, LearningPartner, Classroom, Book, AccessCode, AccessCodeBatch,
  BookEntitlement, ReadingProgress, Bookmark, Highlight, AuditLogEntry, UserRole
} from '../types';

// Mock data
const MOCK_BOOKS: Book[] = [
  {
    id: 'book-1', title: 'Introduction to Computer Science', subtitle: 'A Modern Approach',
    author: 'Dr. Sarah Chen', publisher: 'TechPress', isbn: '978-0-123456-78-9',
    description: 'A comprehensive introduction to computer science covering algorithms, data structures, and computational thinking. This modern textbook uses real-world examples and hands-on exercises to build foundational knowledge.',
    coverUrl: '', language: 'English', edition: '3rd', pageCount: 542,
    categories: ['Computer Science', 'Programming'], tags: ['algorithms', 'data-structures', 'beginner'],
    status: 'published', version: '3.1.0', approvedPartners: ['partner-1', 'partner-2'],
    createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-06-01T10:00:00Z'
  },
  {
    id: 'book-2', title: 'Digital Marketing Fundamentals', subtitle: 'Strategy & Practice',
    author: 'James Morrison', publisher: 'BusinessEdge', isbn: '978-0-987654-32-1',
    description: 'Master the principles of digital marketing from SEO and content strategy to social media and analytics. Includes case studies from leading brands and practical frameworks.',
    coverUrl: '', language: 'English', edition: '2nd', pageCount: 380,
    categories: ['Marketing', 'Business'], tags: ['digital-marketing', 'SEO', 'social-media'],
    status: 'published', version: '2.0.0', approvedPartners: ['partner-1'],
    createdAt: '2024-02-20T10:00:00Z', updatedAt: '2024-05-15T10:00:00Z'
  },
  {
    id: 'book-3', title: 'Advanced Mathematics', subtitle: 'Calculus & Linear Algebra',
    author: 'Prof. Maria Rodriguez', publisher: 'Academic Press', isbn: '978-0-555555-11-2',
    description: 'An advanced treatment of calculus and linear algebra for engineering and science students. Features rigorous proofs, computational methods, and applications.',
    coverUrl: '', language: 'English', edition: '4th', pageCount: 720,
    categories: ['Mathematics', 'Science'], tags: ['calculus', 'linear-algebra', 'proofs'],
    status: 'published', version: '4.2.0', approvedPartners: ['partner-1', 'partner-2'],
    createdAt: '2023-08-10T10:00:00Z', updatedAt: '2024-04-20T10:00:00Z'
  },
  {
    id: 'book-4', title: 'Creative Writing Workshop', subtitle: 'From Idea to Publication',
    author: 'Emily Watson', publisher: 'Literary Arts', isbn: '978-0-333333-44-5',
    description: 'A hands-on guide to creative writing covering fiction, poetry, and non-fiction. Includes writing exercises, revision techniques, and publishing guidance.',
    coverUrl: '', language: 'English', edition: '1st', pageCount: 290,
    categories: ['Writing', 'Arts'], tags: ['creative-writing', 'fiction', 'poetry'],
    status: 'published', version: '1.0.0', approvedPartners: ['partner-2'],
    createdAt: '2024-03-01T10:00:00Z', updatedAt: '2024-03-01T10:00:00Z'
  },
  {
    id: 'book-5', title: 'Data Science with Python', subtitle: 'Machine Learning & Analytics',
    author: 'Dr. Alex Kumar', publisher: 'TechPress', isbn: '978-0-777777-88-9',
    description: 'Learn data science fundamentals using Python, pandas, scikit-learn, and TensorFlow. Covers data wrangling, visualization, statistical analysis, and machine learning.',
    coverUrl: '', language: 'English', edition: '2nd', pageCount: 485,
    categories: ['Computer Science', 'Data Science'], tags: ['python', 'machine-learning', 'analytics'],
    status: 'published', version: '2.1.0', approvedPartners: ['partner-1', 'partner-2'],
    createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-07-01T10:00:00Z'
  },
  {
    id: 'book-6', title: 'World History: Modern Era', subtitle: '1750 to Present',
    author: 'Prof. David Thompson', publisher: 'Heritage Books', isbn: '978-0-111111-22-3',
    description: 'A sweeping narrative of world history from the Enlightenment to the digital age. Examines political revolutions, economic transformations, and cultural movements.',
    coverUrl: '', language: 'English', edition: '3rd', pageCount: 620,
    categories: ['History', 'Social Sciences'], tags: ['world-history', 'modern-era', 'politics'],
    status: 'published', version: '3.0.0', approvedPartners: ['partner-1'],
    createdAt: '2023-11-05T10:00:00Z', updatedAt: '2024-02-10T10:00:00Z'
  }
];

const MOCK_PARTNERS: LearningPartner[] = [
  {
    id: 'partner-1', name: 'Stanford Digital Academy', description: 'Premier online learning institution offering technology and business courses.',
    status: 'active', adminId: 'user-partner1', studentCount: 342, classroomCount: 18,
    bookCount: 5, codeQuota: 1000, codesUsed: 456, canGenerateCodes: true, createdAt: '2023-06-01T10:00:00Z'
  },
  {
    id: 'partner-2', name: 'Global Learning Institute', description: 'International education provider specializing in arts, humanities, and sciences.',
    status: 'active', adminId: 'user-partner2', studentCount: 215, classroomCount: 12,
    bookCount: 4, codeQuota: 500, codesUsed: 189, canGenerateCodes: true, createdAt: '2023-09-15T10:00:00Z'
  },
  {
    id: 'partner-3', name: 'TechBridge Education', description: 'Vocational training provider for emerging technologies.',
    status: 'suspended', adminId: 'user-partner3', studentCount: 0, classroomCount: 0,
    bookCount: 0, codeQuota: 200, codesUsed: 45, canGenerateCodes: false, createdAt: '2024-01-10T10:00:00Z'
  }
];

const MOCK_CLASSROOMS: Classroom[] = [
  {
    id: 'class-1', name: 'CS101 - Fall 2024', partnerId: 'partner-1',
    instructorIds: ['user-partner1'], studentIds: ['user-student1', 'user-student2', 'user-student3'],
    bookIds: ['book-1', 'book-5'], status: 'active', startDate: '2024-09-01', endDate: '2024-12-15',
    createdAt: '2024-08-15T10:00:00Z'
  },
  {
    id: 'class-2', name: 'MKT200 - Digital Strategy', partnerId: 'partner-1',
    instructorIds: ['user-partner1'], studentIds: ['user-student1', 'user-student4'],
    bookIds: ['book-2'], status: 'active', startDate: '2024-09-01', endDate: '2024-12-15',
    createdAt: '2024-08-15T10:00:00Z'
  },
  {
    id: 'class-3', name: 'Creative Writing Workshop', partnerId: 'partner-2',
    instructorIds: ['user-partner2'], studentIds: ['user-student2', 'user-student5'],
    bookIds: ['book-4'], status: 'active', startDate: '2024-09-01',
    createdAt: '2024-08-20T10:00:00Z'
  }
];

const generateCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const MOCK_CODES: AccessCode[] = [
  { id: 'code-1', code: 'ABCD-EFGH-JK23', batchId: 'batch-1', bookId: 'book-1', partnerId: 'partner-1', classroomId: 'class-1', status: 'redeemed', redeemedBy: 'user-student1', redeemedAt: '2024-09-05T10:00:00Z', createdAt: '2024-09-01T10:00:00Z' },
  { id: 'code-2', code: 'LMNP-QRST-UV45', batchId: 'batch-1', bookId: 'book-1', partnerId: 'partner-1', classroomId: 'class-1', status: 'redeemed', redeemedBy: 'user-student2', redeemedAt: '2024-09-06T10:00:00Z', createdAt: '2024-09-01T10:00:00Z' },
  { id: 'code-3', code: 'WXYZ-ABCD-EF67', batchId: 'batch-1', bookId: 'book-1', partnerId: 'partner-1', classroomId: 'class-1', status: 'unused', createdAt: '2024-09-01T10:00:00Z' },
  { id: 'code-4', code: 'GHJK-LMNP-QR89', batchId: 'batch-2', bookId: 'book-5', partnerId: 'partner-1', classroomId: 'class-1', status: 'redeemed', redeemedBy: 'user-student1', redeemedAt: '2024-09-07T10:00:00Z', createdAt: '2024-09-01T10:00:00Z' },
  { id: 'code-5', code: 'STUV-WXYZ-AB12', batchId: 'batch-3', bookId: 'book-2', partnerId: 'partner-1', classroomId: 'class-2', status: 'unused', createdAt: '2024-09-01T10:00:00Z' },
  { id: 'code-6', code: 'CDEF-GHIJ-KL34', batchId: 'batch-4', bookId: 'book-4', partnerId: 'partner-2', classroomId: 'class-3', status: 'unused', createdAt: '2024-09-01T10:00:00Z' },
  { id: 'code-7', code: 'MNOP-QRST-UW56', batchId: 'batch-4', bookId: 'book-4', partnerId: 'partner-2', classroomId: 'class-3', status: 'expired', expiresAt: '2024-08-01T00:00:00Z', createdAt: '2024-07-01T10:00:00Z' },
  { id: 'code-8', code: 'YXWV-UTSR-QP78', batchId: 'batch-1', bookId: 'book-1', partnerId: 'partner-1', status: 'revoked', createdAt: '2024-09-01T10:00:00Z' },
];

const MOCK_BATCHES: AccessCodeBatch[] = [
  { id: 'batch-1', name: 'CS101 Textbook Codes', partnerId: 'partner-1', bookId: 'book-1', codeCount: 50, codesGenerated: 50, codesRedeemed: 2, status: 'active', createdAt: '2024-09-01T10:00:00Z' },
  { id: 'batch-2', name: 'Data Science Access', partnerId: 'partner-1', bookId: 'book-5', codeCount: 30, codesGenerated: 30, codesRedeemed: 1, status: 'active', createdAt: '2024-09-01T10:00:00Z' },
  { id: 'batch-3', name: 'Marketing Codes Fall', partnerId: 'partner-1', bookId: 'book-2', codeCount: 25, codesGenerated: 25, codesRedeemed: 0, status: 'active', createdAt: '2024-09-01T10:00:00Z' },
  { id: 'batch-4', name: 'Creative Writing Batch', partnerId: 'partner-2', bookId: 'book-4', codeCount: 20, codesGenerated: 20, codesRedeemed: 0, status: 'active', createdAt: '2024-09-01T10:00:00Z' },
];

const MOCK_USERS: User[] = [
  { id: 'user-admin', email: 'admin@kitabo.io', name: 'Platform Administrator', role: 'super_admin', createdAt: '2023-01-01T10:00:00Z', lastLogin: '2024-10-15T10:00:00Z' },
  { id: 'user-partner1', email: 'admin@stanford.edu', name: 'Dr. Robert Hayes', role: 'partner_admin', partnerId: 'partner-1', createdAt: '2023-06-01T10:00:00Z', lastLogin: '2024-10-14T10:00:00Z' },
  { id: 'user-partner2', email: 'admin@globallearn.org', name: 'Prof. Lisa Chang', role: 'partner_admin', partnerId: 'partner-2', createdAt: '2023-09-15T10:00:00Z', lastLogin: '2024-10-13T10:00:00Z' },
  { id: 'user-partner3', email: 'admin@techbridge.io', name: 'Mark Stevens', role: 'partner_admin', partnerId: 'partner-3', createdAt: '2024-01-10T10:00:00Z' },
  { id: 'user-student1', email: 'alice@student.edu', name: 'Alice Johnson', role: 'student', partnerId: 'partner-1', createdAt: '2024-09-01T10:00:00Z', lastLogin: '2024-10-15T10:00:00Z' },
  { id: 'user-student2', email: 'bob@student.edu', name: 'Bob Williams', role: 'student', partnerId: 'partner-1', createdAt: '2024-09-01T10:00:00Z', lastLogin: '2024-10-14T10:00:00Z' },
  { id: 'user-student3', email: 'carol@student.edu', name: 'Carol Davis', role: 'student', partnerId: 'partner-1', createdAt: '2024-09-02T10:00:00Z', lastLogin: '2024-10-12T10:00:00Z' },
  { id: 'user-student4', email: 'dan@student.edu', name: 'Dan Miller', role: 'student', partnerId: 'partner-1', createdAt: '2024-09-03T10:00:00Z' },
  { id: 'user-student5', email: 'eve@student.edu', name: 'Eve Thompson', role: 'student', partnerId: 'partner-2', createdAt: '2024-09-05T10:00:00Z', lastLogin: '2024-10-10T10:00:00Z' },
];

const MOCK_ENTITLEMENTS: BookEntitlement[] = [
  { id: 'ent-1', userId: 'user-student1', bookId: 'book-1', codeId: 'code-1', grantedAt: '2024-09-05T10:00:00Z', revoked: false },
  { id: 'ent-2', userId: 'user-student1', bookId: 'book-5', codeId: 'code-4', grantedAt: '2024-09-07T10:00:00Z', revoked: false },
  { id: 'ent-3', userId: 'user-student2', bookId: 'book-1', codeId: 'code-2', grantedAt: '2024-09-06T10:00:00Z', revoked: false },
];

const MOCK_PROGRESS: ReadingProgress[] = [
  { userId: 'user-student1', bookId: 'book-1', currentChapter: 3, currentPage: 45, percentComplete: 32, lastReadAt: '2024-10-15T14:30:00Z', totalReadTime: 4200 },
  { userId: 'user-student1', bookId: 'book-5', currentChapter: 1, currentPage: 12, percentComplete: 8, lastReadAt: '2024-10-14T09:00:00Z', totalReadTime: 1800 },
  { userId: 'user-student2', bookId: 'book-1', currentChapter: 5, currentPage: 78, percentComplete: 55, lastReadAt: '2024-10-14T16:00:00Z', totalReadTime: 6300 },
];

const MOCK_BOOKMARKS: Bookmark[] = [
  { id: 'bm-1', userId: 'user-student1', bookId: 'book-1', chapter: 2, page: 30, label: 'Important definitions', createdAt: '2024-10-10T10:00:00Z' },
  { id: 'bm-2', userId: 'user-student1', bookId: 'book-1', chapter: 3, page: 45, label: 'Quiz review', createdAt: '2024-10-15T10:00:00Z' },
];

const MOCK_HIGHLIGHTS: Highlight[] = [
  { id: 'hl-1', userId: 'user-student1', bookId: 'book-1', chapter: 1, page: 12, text: 'An algorithm is a step-by-step procedure for solving a problem or accomplishing a task.', color: 'yellow', note: 'Key definition for exam', createdAt: '2024-10-08T10:00:00Z', updatedAt: '2024-10-08T10:00:00Z' },
  { id: 'hl-2', userId: 'user-student1', bookId: 'book-1', chapter: 2, page: 28, text: 'Data structures organize and store data efficiently, enabling faster access and modification.', color: 'green', createdAt: '2024-10-10T10:00:00Z', updatedAt: '2024-10-10T10:00:00Z' },
  { id: 'hl-3', userId: 'user-student2', bookId: 'book-1', chapter: 1, page: 15, text: 'Computational thinking involves breaking complex problems into smaller, manageable parts.', color: 'blue', note: 'Chapter 1 main concept', createdAt: '2024-10-09T10:00:00Z', updatedAt: '2024-10-09T10:00:00Z' },
];

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'log-1', userId: 'user-admin', action: 'partner.created', resource: 'LearningPartner', resourceId: 'partner-2', details: 'Created Global Learning Institute', createdAt: '2023-09-15T10:00:00Z' },
  { id: 'log-2', userId: 'user-admin', action: 'book.published', resource: 'Book', resourceId: 'book-5', details: 'Published Data Science with Python v2.1.0', createdAt: '2024-07-01T10:00:00Z' },
  { id: 'log-3', userId: 'user-partner1', action: 'code.batch_created', resource: 'AccessCodeBatch', resourceId: 'batch-1', details: 'Generated 50 codes for CS101', createdAt: '2024-09-01T10:00:00Z' },
  { id: 'log-4', userId: 'user-student1', action: 'code.redeemed', resource: 'AccessCode', resourceId: 'code-1', details: 'Redeemed code for Introduction to Computer Science', createdAt: '2024-09-05T10:00:00Z' },
  { id: 'log-5', userId: 'user-admin', action: 'partner.suspended', resource: 'LearningPartner', resourceId: 'partner-3', details: 'Suspended TechBridge Education', createdAt: '2024-08-01T10:00:00Z' },
  { id: 'log-6', userId: 'user-partner1', action: 'classroom.created', resource: 'Classroom', resourceId: 'class-1', details: 'Created CS101 - Fall 2024', createdAt: '2024-08-15T10:00:00Z' },
  { id: 'log-7', userId: 'user-student1', action: 'reading.progress', resource: 'Book', resourceId: 'book-1', details: 'Reading progress updated to 32%', createdAt: '2024-10-15T14:30:00Z' },
];

// Book content for the reader
const BOOK_CONTENT: Record<string, { chapters: { title: string; content: string }[] }> = {
  'book-1': {
    chapters: [
      {
        title: 'Chapter 1: What is Computer Science?',
        content: `Computer science is the study of computation, information, and automation. It spans theoretical studies of algorithms, computation, and information to practical approaches for implementing these in computer systems.

At its core, computer science is about problem-solving. It teaches us to think systematically about complex challenges, breaking them into manageable components that can be addressed through logical reasoning and creative thinking.

**The Nature of Computing**

Computing is not just about programming. It encompasses a broad range of activities including:

- Designing algorithms that efficiently solve problems
- Building systems that process and store information
- Understanding the theoretical limits of what can be computed
- Creating software that serves human needs
- Analyzing the social and ethical implications of technology

**Historical Context**

The field has evolved dramatically since its origins. From Charles Babbage's Analytical Engine in the 1830s to Alan Turing's theoretical foundations in the 1930s, to the personal computer revolution of the 1980s, and the internet age of the 1990s and beyond — computing has continuously transformed how we live, work, and communicate.

**Key Principles**

An algorithm is a step-by-step procedure for solving a problem or accomplishing a task. This fundamental concept underlies all of computer science. Whether we're sorting a list of names, finding the shortest route between cities, or training an artificial intelligence system, we rely on well-designed algorithms.

Computational thinking involves breaking complex problems into smaller, manageable parts. This approach — decomposition, pattern recognition, abstraction, and algorithm design — is valuable far beyond computer science itself.

**Why Study Computer Science?**

In today's world, computing touches virtually every aspect of modern life. From healthcare and education to entertainment and transportation, software and algorithms shape our daily experiences. Understanding computer science empowers you to:

1. Solve complex problems systematically
2. Create technology that improves lives
3. Understand the digital world around you
4. Contribute to innovation across all industries
5. Make informed decisions about technology use

The demand for computer science skills continues to grow across all sectors, making it one of the most valuable fields of study in the 21st century.`
      },
      {
        title: 'Chapter 2: Data and Information',
        content: `Data is the foundation of all computing. Understanding how data is represented, stored, and processed is essential for any computer scientist.

**Binary Representation**

At the lowest level, computers represent all information using binary digits — bits — that can be either 0 or 1. This binary system may seem limited, but combinations of bits can represent any type of data: numbers, text, images, sound, and video.

A single bit can represent two states. Eight bits (a byte) can represent 256 different values. Modern computers process billions of bits per second, enabling the complex operations we take for granted.

**Data Types**

Programming languages provide various data types to represent different kinds of information:

- **Integers** for whole numbers
- **Floating-point numbers** for decimal values
- **Characters and strings** for text
- **Booleans** for true/false values
- **Arrays and lists** for collections of data
- **Objects and structures** for complex, related data

**Data Structures**

Data structures organize and store data efficiently, enabling faster access and modification. Choosing the right data structure for a problem is one of the most important skills in computer science.

Common data structures include:

- Arrays: Contiguous memory locations for sequential access
- Linked Lists: Nodes connected by pointers for flexible sizing
- Stacks: Last-in, first-out (LIFO) organization
- Queues: First-in, first-out (FIFO) organization
- Trees: Hierarchical structures for organized data
- Graphs: Networks of connected nodes
- Hash Tables: Key-value pairs for fast lookup

The efficiency of operations on these structures — insertion, deletion, search, and traversal — varies significantly. Understanding these tradeoffs is crucial for writing efficient programs.

**Information vs. Data**

Data becomes information when it is organized, structured, and given context. A random sequence of numbers is data; a temperature reading of 98.6°F is information. Computer science helps us transform raw data into meaningful information through processing, analysis, and visualization.`
      },
      {
        title: 'Chapter 3: Algorithms and Problem Solving',
        content: `Algorithms are the heart of computer science. An algorithm is a precise, step-by-step procedure for solving a problem or performing a computation.

**What Makes a Good Algorithm?**

A good algorithm must be:
1. **Correct** — it produces the right output for every valid input
2. **Efficient** — it uses resources (time and memory) wisely
3. **Clear** — it can be understood and verified
4. **Finite** — it terminates after a bounded number of steps

**Algorithm Design Strategies**

Several strategies help us design effective algorithms:

- **Divide and Conquer**: Break a problem into smaller subproblems, solve each independently, then combine the results. Examples include merge sort and quicksort.

- **Greedy Approach**: Make the locally optimal choice at each step, hoping to find a global optimum. Works well for some problems like minimum spanning trees.

- **Dynamic Programming**: Solve complex problems by breaking them into overlapping subproblems and storing intermediate results. Used for optimization problems like the knapsack problem.

- **Backtracking**: Explore possible solutions incrementally, abandoning paths that cannot lead to a valid solution. Used in constraint satisfaction problems.

**Sorting Algorithms**

Sorting is one of the most fundamental operations in computing. Different sorting algorithms offer different tradeoffs:

- Bubble Sort: Simple but slow — O(n²)
- Selection Sort: Also O(n²), slightly fewer swaps
- Insertion Sort: Efficient for nearly sorted data
- Merge Sort: Consistent O(n log n) performance
- Quick Sort: Fast average case, O(n log n)
- Heap Sort: Guaranteed O(n log n), in-place

**Searching Algorithms**

Finding data efficiently is equally important:

- Linear Search: Check each element — O(n)
- Binary Search: Halve the search space each step — O(log n), requires sorted data
- Hash-based Search: Direct lookup — O(1) average case

**Complexity Analysis**

We measure algorithm efficiency using Big-O notation, which describes how the running time or space requirements grow as the input size increases. Understanding complexity helps us predict performance and choose appropriate algorithms for different situations.`
      },
      {
        title: 'Chapter 4: Programming Fundamentals',
        content: `Programming is the art and science of writing instructions that a computer can execute. It transforms algorithmic thinking into working software.

**Programming Paradigms**

Different paradigms offer different approaches to organizing code:

- **Imperative Programming**: Describes computation as sequences of statements that change program state.
- **Object-Oriented Programming**: Organizes code around objects that combine data and behavior.
- **Functional Programming**: Treats computation as evaluation of mathematical functions, avoiding state mutation.
- **Declarative Programming**: Describes what should be computed rather than how.

**Variables and Types**

Variables store data that programs manipulate. Strong typing helps catch errors early by ensuring operations are applied to appropriate data types.

**Control Flow**

Programs make decisions and repeat actions using:
- Conditional statements (if/else)
- Loops (for, while)
- Function calls
- Exception handling

**Functions and Modularity**

Functions encapsulate reusable logic, making code more organized, testable, and maintainable. Good function design follows the principle of single responsibility — each function does one thing well.

**Error Handling**

Robust programs anticipate and handle errors gracefully. Exception handling mechanisms allow programs to respond to unexpected situations without crashing.

**Testing**

Testing verifies that programs behave correctly. Types of testing include:
- Unit tests: Test individual functions or methods
- Integration tests: Test interactions between components
- End-to-end tests: Test complete user workflows
- Performance tests: Measure speed and resource usage

Writing tests alongside code (test-driven development) helps ensure correctness and makes future changes safer.`
      },
      {
        title: 'Chapter 5: Systems and Architecture',
        content: `Understanding computer systems and architecture helps us write more efficient programs and make better design decisions.

**The Von Neumann Architecture**

Most modern computers follow the Von Neumann architecture, which consists of:
- A central processing unit (CPU)
- Memory (RAM) for storing programs and data
- Input/output devices
- A bus system connecting components

**Operating Systems**

The operating system manages hardware resources and provides services to applications. Key responsibilities include:
- Process management and scheduling
- Memory management and virtual memory
- File system organization
- Device driver management
- Security and access control

**Networking**

Computer networks enable communication between systems. The Internet Protocol suite (TCP/IP) forms the foundation of modern networking:
- Application layer: HTTP, SMTP, FTP
- Transport layer: TCP, UDP
- Internet layer: IP, ICMP
- Link layer: Ethernet, WiFi

**Databases**

Databases organize and manage persistent data. Relational databases use tables with defined schemas and SQL for querying. NoSQL databases offer flexible schemas for different use cases.

**Cloud Computing**

Cloud computing provides on-demand access to computing resources over the internet. Service models include:
- Infrastructure as a Service (IaaS)
- Platform as a Service (PaaS)
- Software as a Service (SaaS)

Cloud computing has transformed how organizations build and deploy software, enabling scalability, reliability, and cost efficiency.`
      }
    ]
  }
};

// Default content for books that don't have specific content
const DEFAULT_BOOK_CONTENT = {
  chapters: [
    {
      title: 'Chapter 1: Introduction',
      content: `Welcome to this book. This chapter provides an overview of the subject matter and sets the foundation for the topics covered in subsequent chapters.

The material in this book is organized to guide you from fundamental concepts to more advanced topics. Each chapter builds upon the previous one, creating a comprehensive learning experience.

**What You Will Learn**

This book covers essential concepts and practical applications. By the end of your reading, you will have a solid understanding of the core principles and be able to apply them in real-world situations.

**How to Use This Book**

We recommend reading the chapters in order for the best learning experience. However, if you have prior knowledge of certain topics, feel free to skip ahead. Each chapter includes:

- Key concepts and definitions
- Detailed explanations with examples
- Practice exercises
- Summary points for review

Take notes, highlight important passages, and use the bookmark feature to mark sections you want to revisit. Your progress is automatically saved, so you can pick up right where you left off.`
    },
    {
      title: 'Chapter 2: Core Concepts',
      content: `This chapter explores the fundamental concepts that form the backbone of the subject. Understanding these principles is essential for mastering the more advanced material that follows.

**Foundational Principles**

Every field of study rests on a set of core principles. These principles have been developed and refined over time through research, practice, and critical analysis.

The key principles we'll examine in this chapter are:

1. The theoretical framework that underpins the discipline
2. The practical methodologies used in real-world applications
3. The analytical tools for evaluating and improving outcomes
4. The ethical considerations that guide professional practice

**Building Understanding**

Learning is a progressive process. We start with simple concepts and gradually build complexity. This approach — known as scaffolding in educational theory — ensures that each new idea connects to what you already know.

As you read, try to connect new information to your existing knowledge. Ask questions, make predictions, and test your understanding. Active engagement with the material leads to deeper and more lasting learning.

**Key Takeaways**

- Core concepts provide the foundation for advanced study
- Theoretical understanding enables practical application
- Critical thinking is essential for mastery
- Continuous learning is a hallmark of expertise`
    },
    {
      title: 'Chapter 3: Applications',
      content: `Theory becomes meaningful when applied to real-world situations. This chapter demonstrates how the concepts from previous chapters are used in practice.

**Case Studies**

Real-world applications illustrate the power and versatility of the principles we've studied. Each case study demonstrates different aspects of the theory in action.

**Practical Implementation**

Moving from theory to practice requires careful planning and execution. The following steps guide effective implementation:

1. Define clear objectives and success criteria
2. Gather relevant data and resources
3. Apply appropriate methodologies
4. Monitor progress and adjust as needed
5. Evaluate outcomes against objectives
6. Document lessons learned

**Common Challenges**

Implementation rarely goes exactly as planned. Common challenges include:
- Resource constraints
- Unexpected complexity
- Communication gaps
- Changing requirements
- Technical limitations

Successful practitioners anticipate these challenges and develop strategies to address them proactively.

**Best Practices**

Based on extensive research and professional experience, the following best practices have emerged:

- Start with a clear understanding of the problem
- Involve stakeholders early and often
- Iterate and refine rather than seeking perfection
- Document decisions and rationale
- Share knowledge and learn from others`
    }
  ]
};

// State types
interface AppState {
  currentUser: User | null;
  users: User[];
  partners: LearningPartner[];
  classrooms: Classroom[];
  books: Book[];
  codes: AccessCode[];
  batches: AccessCodeBatch[];
  entitlements: BookEntitlement[];
  progress: ReadingProgress[];
  bookmarks: Bookmark[];
  highlights: Highlight[];
  auditLogs: AuditLogEntry[];
  notifications: { id: string; message: string; type: 'success' | 'error' | 'info'; timestamp: number }[];
}

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_PARTNER'; payload: LearningPartner }
  | { type: 'UPDATE_PARTNER'; payload: LearningPartner }
  | { type: 'ADD_CLASSROOM'; payload: Classroom }
  | { type: 'UPDATE_CLASSROOM'; payload: Classroom }
  | { type: 'DELETE_CLASSROOM'; payload: string }
  | { type: 'ADD_BOOK'; payload: Book }
  | { type: 'UPDATE_BOOK'; payload: Book }
  | { type: 'ADD_CODE_BATCH'; payload: { batch: AccessCodeBatch; codes: AccessCode[] } }
  | { type: 'REDEEM_CODE'; payload: { codeId: string; userId: string; entitlement: BookEntitlement } }
  | { type: 'REVOKE_CODE'; payload: string }
  | { type: 'UPDATE_PROGRESS'; payload: ReadingProgress }
  | { type: 'ADD_BOOKMARK'; payload: Bookmark }
  | { type: 'DELETE_BOOKMARK'; payload: string }
  | { type: 'ADD_HIGHLIGHT'; payload: Highlight }
  | { type: 'UPDATE_HIGHLIGHT'; payload: Highlight }
  | { type: 'DELETE_HIGHLIGHT'; payload: string }
  | { type: 'ADD_AUDIT_LOG'; payload: AuditLogEntry }
  | { type: 'ADD_NOTIFICATION'; payload: { message: string; type: 'success' | 'error' | 'info' } }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User };

function loadState(): AppState {
  try {
    const saved = localStorage.getItem('kitabo-state');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return {
    currentUser: null,
    users: MOCK_USERS,
    partners: MOCK_PARTNERS,
    classrooms: MOCK_CLASSROOMS,
    books: MOCK_BOOKS,
    codes: MOCK_CODES,
    batches: MOCK_BATCHES,
    entitlements: MOCK_ENTITLEMENTS,
    progress: MOCK_PROGRESS,
    bookmarks: MOCK_BOOKMARKS,
    highlights: MOCK_HIGHLIGHTS,
    auditLogs: MOCK_AUDIT_LOGS,
    notifications: [],
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: { ...action.payload, lastLogin: new Date().toISOString() } };
    case 'LOGOUT':
      return { ...state, currentUser: null };
    case 'ADD_PARTNER':
      return { ...state, partners: [...state.partners, action.payload] };
    case 'UPDATE_PARTNER':
      return { ...state, partners: state.partners.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'ADD_CLASSROOM':
      return { ...state, classrooms: [...state.classrooms, action.payload] };
    case 'UPDATE_CLASSROOM':
      return { ...state, classrooms: state.classrooms.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CLASSROOM':
      return { ...state, classrooms: state.classrooms.filter(c => c.id !== action.payload) };
    case 'ADD_BOOK':
      return { ...state, books: [...state.books, action.payload] };
    case 'UPDATE_BOOK':
      return { ...state, books: state.books.map(b => b.id === action.payload.id ? action.payload : b) };
    case 'ADD_CODE_BATCH':
      return { ...state, batches: [...state.batches, action.payload.batch], codes: [...state.codes, ...action.payload.codes] };
    case 'REDEEM_CODE':
      return {
        ...state,
        codes: state.codes.map(c => c.id === action.payload.codeId ? { ...c, status: 'redeemed' as const, redeemedBy: action.payload.userId, redeemedAt: new Date().toISOString() } : c),
        entitlements: [...state.entitlements, action.payload.entitlement],
        batches: state.batches.map(b => b.id === state.codes.find(c => c.id === action.payload.codeId)?.batchId ? { ...b, codesRedeemed: b.codesRedeemed + 1 } : b),
      };
    case 'REVOKE_CODE':
      return { ...state, codes: state.codes.map(c => c.id === action.payload ? { ...c, status: 'revoked' as const } : c) };
    case 'UPDATE_PROGRESS':
      return { ...state, progress: state.progress.filter(p => !(p.userId === action.payload.userId && p.bookId === action.payload.bookId)).concat(action.payload) };
    case 'ADD_BOOKMARK':
      return { ...state, bookmarks: [...state.bookmarks, action.payload] };
    case 'DELETE_BOOKMARK':
      return { ...state, bookmarks: state.bookmarks.filter(b => b.id !== action.payload) };
    case 'ADD_HIGHLIGHT':
      return { ...state, highlights: [...state.highlights, action.payload] };
    case 'UPDATE_HIGHLIGHT':
      return { ...state, highlights: state.highlights.map(h => h.id === action.payload.id ? action.payload : h) };
    case 'DELETE_HIGHLIGHT':
      return { ...state, highlights: state.highlights.filter(h => h.id !== action.payload) };
    case 'ADD_AUDIT_LOG':
      return { ...state, auditLogs: [action.payload, ...state.auditLogs].slice(0, 200) };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, { id: uuidv4(), ...action.payload, timestamp: Date.now() }] };
    case 'DISMISS_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return { ...state, users: state.users.map(u => u.id === action.payload.id ? action.payload : u) };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getBookContent: (bookId: string) => { chapters: { title: string; content: string }[] };
  generateCodes: (batchId: string, bookId: string, partnerId: string | undefined, count: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem('kitabo-state', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [state]);

  // Auto-dismiss notifications
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      state.notifications.forEach(n => {
        if (now - n.timestamp > 5000) {
          dispatch({ type: 'DISMISS_NOTIFICATION', payload: n.id });
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.notifications]);

  const getBookContent = (bookId: string) => {
    return BOOK_CONTENT[bookId] || DEFAULT_BOOK_CONTENT;
  };

  const generateCodes = (batchId: string, bookId: string, partnerId: string | undefined, count: number) => {
    const codes: AccessCode[] = Array.from({ length: count }, () => ({
      id: uuidv4(),
      code: generateCode(),
      batchId,
      bookId,
      partnerId,
      status: 'unused' as const,
      createdAt: new Date().toISOString(),
    }));
    const batch = state.batches.find(b => b.id === batchId);
    if (batch) {
      dispatch({
        type: 'ADD_CODE_BATCH',
        payload: { batch: { ...batch, codesGenerated: batch.codesGenerated + count }, codes }
      });
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, getBookContent, generateCodes }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
