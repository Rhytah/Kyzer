// src/lib/editor/blockRegistry.js
import {
  Type,
  Image,
  Video,
  FileText,
  ClipboardCheck,
  Code,
  Layout,
  Heading,
  List,
  Link,
  Table,
  Minus,
} from 'lucide-react';

/**
 * Registry of all available content block types
 */

export const BLOCK_TYPES = {
  TEXT: 'text',
  HEADING: 'heading',
  IMAGE: 'image',
  VIDEO: 'video',
  PDF: 'pdf',
  QUIZ: 'quiz',
  EMBED: 'embed',
  CODE: 'code',
  LIST: 'list',
  TABLE: 'table',
  LINK: 'link',
  DIVIDER: 'divider',
  SPACER: 'spacer',
  PAGE_BREAK: 'page_break',
  PRESENTATION: 'presentation',
  SCORM: 'scorm',
};

export const BLOCK_CATEGORIES = {
  BASIC: 'basic',
  MEDIA: 'media',
  INTERACTIVE: 'interactive',
  LAYOUT: 'layout',
  ADVANCED: 'advanced',
};

/**
 * Block definitions with metadata
 */
export const BLOCK_REGISTRY = {
  [BLOCK_TYPES.TEXT]: {
    type: BLOCK_TYPES.TEXT,
    name: 'Text Block',
    description: 'Rich text content with formatting',
    category: BLOCK_CATEGORIES.BASIC,
    icon: Type,
    defaultData: {
      content: '<p>Start typing...</p>',
      fontSize: 16,
      fontFamily: 'Inter',
      color: '#000000',
      alignment: 'left',
    },
    settings: [
      { name: 'content', type: 'richtext', label: 'Content' },
      { name: 'fontSize', type: 'number', label: 'Font Size', min: 12, max: 72 },
      { name: 'fontFamily', type: 'select', label: 'Font Family', options: ['Inter', 'Arial', 'Georgia', 'Courier'] },
      { name: 'color', type: 'color', label: 'Text Color' },
      { name: 'alignment', type: 'select', label: 'Alignment', options: ['left', 'center', 'right', 'justify'] },
    ],
  },

  [BLOCK_TYPES.HEADING]: {
    type: BLOCK_TYPES.HEADING,
    name: 'Heading',
    description: 'Section heading or title',
    category: BLOCK_CATEGORIES.BASIC,
    icon: Heading,
    defaultData: {
      text: 'Heading Text',
      level: 2,
      color: '#000000',
      alignment: 'left',
    },
    settings: [
      { name: 'text', type: 'text', label: 'Text' },
      { name: 'level', type: 'select', label: 'Level', options: [1, 2, 3, 4, 5, 6] },
      { name: 'color', type: 'color', label: 'Color' },
      { name: 'alignment', type: 'select', label: 'Alignment', options: ['left', 'center', 'right'] },
    ],
  },

  [BLOCK_TYPES.IMAGE]: {
    type: BLOCK_TYPES.IMAGE,
    name: 'Image',
    description: 'Display an image',
    category: BLOCK_CATEGORIES.MEDIA,
    icon: Image,
    defaultData: {
      src: null,
      alt: '',
      width: '100%',
      height: 'auto',
      objectFit: 'contain',
      caption: '',
    },
    settings: [
      { name: 'src', type: 'image', label: 'Image URL' },
      { name: 'alt', type: 'text', label: 'Alt Text' },
      { name: 'width', type: 'text', label: 'Width' },
      { name: 'height', type: 'text', label: 'Height' },
      { name: 'objectFit', type: 'select', label: 'Fit', options: ['contain', 'cover', 'fill', 'none'] },
      { name: 'caption', type: 'text', label: 'Caption' },
    ],
  },

  [BLOCK_TYPES.VIDEO]: {
    type: BLOCK_TYPES.VIDEO,
    name: 'Video',
    description: 'Embed a video player',
    category: BLOCK_CATEGORIES.MEDIA,
    icon: Video,
    defaultData: {
      src: null,
      type: 'upload', // 'upload' | 'youtube' | 'vimeo' | 'embed'
      autoplay: false,
      controls: true,
      loop: false,
      muted: false,
      width: '100%',
      height: '400px',
    },
    settings: [
      { name: 'src', type: 'video', label: 'Video URL' },
      { name: 'type', type: 'select', label: 'Type', options: ['upload', 'youtube', 'vimeo', 'embed'] },
      { name: 'autoplay', type: 'checkbox', label: 'Autoplay' },
      { name: 'controls', type: 'checkbox', label: 'Show Controls' },
      { name: 'loop', type: 'checkbox', label: 'Loop' },
      { name: 'muted', type: 'checkbox', label: 'Muted' },
      { name: 'width', type: 'text', label: 'Width' },
      { name: 'height', type: 'text', label: 'Height' },
    ],
  },

  [BLOCK_TYPES.PDF]: {
    type: BLOCK_TYPES.PDF,
    name: 'PDF Viewer',
    description: 'Display PDF documents',
    category: BLOCK_CATEGORIES.MEDIA,
    icon: FileText,
    defaultData: {
      src: null,
      pages: 'all', // 'all' | array of page numbers
      height: '600px',
      downloadable: true,
      printable: true,
    },
    settings: [
      { name: 'src', type: 'file', label: 'PDF File', accept: '.pdf' },
      { name: 'height', type: 'text', label: 'Height' },
      { name: 'downloadable', type: 'checkbox', label: 'Allow Download' },
      { name: 'printable', type: 'checkbox', label: 'Allow Print' },
    ],
  },

  [BLOCK_TYPES.QUIZ]: {
    type: BLOCK_TYPES.QUIZ,
    name: 'Quiz',
    description: 'Interactive quiz or assessment',
    category: BLOCK_CATEGORIES.INTERACTIVE,
    icon: ClipboardCheck,
    defaultData: {
      quizId: null,
      title: 'Quiz',
      questions: [],
      passThreshold: 70,
      showResults: true,
      allowRetakes: true,
    },
    settings: [
      { name: 'quizId', type: 'quiz-selector', label: 'Select Quiz' },
      { name: 'title', type: 'text', label: 'Title' },
      { name: 'passThreshold', type: 'number', label: 'Pass Threshold (%)', min: 0, max: 100 },
      { name: 'showResults', type: 'checkbox', label: 'Show Results' },
      { name: 'allowRetakes', type: 'checkbox', label: 'Allow Retakes' },
    ],
  },

  [BLOCK_TYPES.EMBED]: {
    type: BLOCK_TYPES.EMBED,
    name: 'Embed',
    description: 'Embed external content',
    category: BLOCK_CATEGORIES.ADVANCED,
    icon: Code,
    defaultData: {
      embedCode: '',
      src: '',
      type: 'iframe', // 'iframe' | 'html' | 'script'
      width: '100%',
      height: '400px',
    },
    settings: [
      { name: 'embedCode', type: 'textarea', label: 'Embed Code' },
      { name: 'src', type: 'text', label: 'URL' },
      { name: 'type', type: 'select', label: 'Type', options: ['iframe', 'html', 'script'] },
      { name: 'width', type: 'text', label: 'Width' },
      { name: 'height', type: 'text', label: 'Height' },
    ],
  },

  [BLOCK_TYPES.CODE]: {
    type: BLOCK_TYPES.CODE,
    name: 'Code Block',
    description: 'Display code with syntax highlighting',
    category: BLOCK_CATEGORIES.ADVANCED,
    icon: Code,
    defaultData: {
      code: '// Start coding...',
      language: 'javascript',
      theme: 'dark',
      lineNumbers: true,
      highlightLines: [],
    },
    settings: [
      { name: 'code', type: 'code', label: 'Code' },
      { name: 'language', type: 'select', label: 'Language', options: ['javascript', 'python', 'java', 'html', 'css', 'sql'] },
      { name: 'theme', type: 'select', label: 'Theme', options: ['light', 'dark'] },
      { name: 'lineNumbers', type: 'checkbox', label: 'Show Line Numbers' },
    ],
  },

  [BLOCK_TYPES.LIST]: {
    type: BLOCK_TYPES.LIST,
    name: 'List',
    description: 'Ordered or unordered list',
    category: BLOCK_CATEGORIES.BASIC,
    icon: List,
    defaultData: {
      items: ['Item 1', 'Item 2', 'Item 3'],
      ordered: false,
      style: 'disc', // 'disc' | 'circle' | 'square' | 'decimal' | 'lower-alpha'
    },
    settings: [
      { name: 'items', type: 'array', label: 'Items' },
      { name: 'ordered', type: 'checkbox', label: 'Ordered List' },
      { name: 'style', type: 'select', label: 'Style', options: ['disc', 'circle', 'square', 'decimal', 'lower-alpha'] },
    ],
  },

  [BLOCK_TYPES.TABLE]: {
    type: BLOCK_TYPES.TABLE,
    name: 'Table',
    description: 'Data table with rows and columns',
    category: BLOCK_CATEGORIES.LAYOUT,
    icon: Table,
    defaultData: {
      headers: ['Column 1', 'Column 2', 'Column 3'],
      rows: [
        ['Cell 1', 'Cell 2', 'Cell 3'],
        ['Cell 4', 'Cell 5', 'Cell 6'],
      ],
      striped: true,
      bordered: true,
    },
    settings: [
      { name: 'headers', type: 'array', label: 'Headers' },
      { name: 'rows', type: 'table-data', label: 'Data' },
      { name: 'striped', type: 'checkbox', label: 'Striped Rows' },
      { name: 'bordered', type: 'checkbox', label: 'Show Borders' },
    ],
  },

  [BLOCK_TYPES.LINK]: {
    type: BLOCK_TYPES.LINK,
    name: 'Link Button',
    description: 'Call-to-action link or button',
    category: BLOCK_CATEGORIES.BASIC,
    icon: Link,
    defaultData: {
      text: 'Click Here',
      href: '#',
      target: '_blank',
      variant: 'primary', // 'primary' | 'secondary' | 'outline' | 'text'
      size: 'medium', // 'small' | 'medium' | 'large'
      alignment: 'left',
    },
    settings: [
      { name: 'text', type: 'text', label: 'Button Text' },
      { name: 'href', type: 'text', label: 'URL' },
      { name: 'target', type: 'select', label: 'Target', options: ['_self', '_blank'] },
      { name: 'variant', type: 'select', label: 'Style', options: ['primary', 'secondary', 'outline', 'text'] },
      { name: 'size', type: 'select', label: 'Size', options: ['small', 'medium', 'large'] },
      { name: 'alignment', type: 'select', label: 'Alignment', options: ['left', 'center', 'right'] },
    ],
  },

  [BLOCK_TYPES.DIVIDER]: {
    type: BLOCK_TYPES.DIVIDER,
    name: 'Divider',
    description: 'Horizontal line separator',
    category: BLOCK_CATEGORIES.LAYOUT,
    icon: Layout,
    defaultData: {
      style: 'solid', // 'solid' | 'dashed' | 'dotted'
      thickness: 1,
      color: '#e5e7eb',
      width: '100%',
      spacing: 'medium', // 'small' | 'medium' | 'large'
    },
    settings: [
      { name: 'style', type: 'select', label: 'Style', options: ['solid', 'dashed', 'dotted'] },
      { name: 'thickness', type: 'number', label: 'Thickness (px)', min: 1, max: 10 },
      { name: 'color', type: 'color', label: 'Color' },
      { name: 'width', type: 'text', label: 'Width' },
      { name: 'spacing', type: 'select', label: 'Spacing', options: ['small', 'medium', 'large'] },
    ],
  },

  [BLOCK_TYPES.SPACER]: {
    type: BLOCK_TYPES.SPACER,
    name: 'Spacer',
    description: 'Empty space for layout',
    category: BLOCK_CATEGORIES.LAYOUT,
    icon: Layout,
    defaultData: {
      height: '40px',
    },
    settings: [
      { name: 'height', type: 'text', label: 'Height' },
    ],
  },

  [BLOCK_TYPES.PAGE_BREAK]: {
    type: BLOCK_TYPES.PAGE_BREAK,
    name: 'Page Break',
    description: 'Start a new page/slide',
    category: BLOCK_CATEGORIES.LAYOUT,
    icon: Minus,
    label: 'Page Break',
    defaultData: {
      backgroundColor: '#ffffff',
      showPageNumber: true,
    },
    settings: [
      { name: 'backgroundColor', type: 'color', label: 'Page Background Color' },
      { name: 'showPageNumber', type: 'checkbox', label: 'Show Page Number' },
    ],
  },

  // PRESENTATION and SCORM blocks are excluded from the editor
  // These complex content types should be managed through their dedicated interfaces:
  // - Presentations: Use Presentation Management (PresentationManagement.jsx)
  // - SCORM: Use SCORM upload tools in Course/Lesson Management
  // The viewer/player can still render these blocks, but they won't appear in the editor sidebar.

  // [BLOCK_TYPES.PRESENTATION]: {
  //   type: BLOCK_TYPES.PRESENTATION,
  //   name: 'Presentation',
  //   description: 'Slide-based presentation',
  //   category: BLOCK_CATEGORIES.INTERACTIVE,
  //   icon: Layout,
  //   defaultData: {
  //     presentationId: null,
  //     autoPlay: false,
  //     showControls: true,
  //     allowFullscreen: true,
  //   },
  //   settings: [
  //     { name: 'presentationId', type: 'presentation-selector', label: 'Select Presentation' },
  //     { name: 'autoPlay', type: 'checkbox', label: 'Auto Play' },
  //     { name: 'showControls', type: 'checkbox', label: 'Show Controls' },
  //     { name: 'allowFullscreen', type: 'checkbox', label: 'Allow Fullscreen' },
  //   ],
  // },

  // [BLOCK_TYPES.SCORM]: {
  //   type: BLOCK_TYPES.SCORM,
  //   name: 'SCORM Package',
  //   description: 'Interactive SCORM content',
  //   category: BLOCK_CATEGORIES.ADVANCED,
  //   icon: FileText,
  //   defaultData: {
  //     packageUrl: null,
  //     height: '600px',
  //     trackProgress: true,
  //   },
  //   settings: [
  //     { name: 'packageUrl', type: 'file', label: 'SCORM Package', accept: '.zip' },
  //     { name: 'height', type: 'text', label: 'Height' },
  //     { name: 'trackProgress', type: 'checkbox', label: 'Track Progress' },
  //   ],
  // },
};

/**
 * Get block definition by type
 */
export const getBlockDefinition = (type) => {
  return BLOCK_REGISTRY[type] || null;
};

/**
 * Get all blocks in a category
 */
export const getBlocksByCategory = (category) => {
  return Object.values(BLOCK_REGISTRY).filter(
    (block) => block.category === category
  );
};

/**
 * Get all available block types
 */
export const getAllBlockTypes = () => {
  return Object.values(BLOCK_REGISTRY);
};

/**
 * Create a new block instance
 */
export const createBlock = (type, customData = {}) => {
  const definition = getBlockDefinition(type);
  if (!definition) {
    throw new Error(`Unknown block type: ${type}`);
  }

  return {
    id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    data: { ...definition.defaultData, ...customData },
    position: { x: 0, y: 0 },
    size: { width: 800, height: 400 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Validate block data against its definition
 */
export const validateBlock = (block) => {
  const definition = getBlockDefinition(block.type);
  if (!definition) {
    return { valid: false, errors: [`Unknown block type: ${block.type}`] };
  }

  const errors = [];

  // Check required fields based on settings
  definition.settings.forEach((setting) => {
    if (setting.required && !block.data[setting.name]) {
      errors.push(`Missing required field: ${setting.label}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Export block to JSON
 */
export const exportBlock = (block) => {
  return JSON.stringify(block, null, 2);
};

/**
 * Import block from JSON
 */
export const importBlock = (json) => {
  try {
    const block = JSON.parse(json);
    const validation = validateBlock(block);

    if (!validation.valid) {
      throw new Error(`Invalid block: ${validation.errors.join(', ')}`);
    }

    return block;
  } catch (error) {
    throw new Error(`Failed to import block: ${error.message}`);
  }
};
