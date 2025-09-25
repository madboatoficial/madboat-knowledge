# 🎨 Sistema de Design - Componentes UI

## Visão Geral

O design system do MadBoat v3 é baseado em uma filosofia monochrome minimalista que utiliza preto e branco como cores primárias, com acentos coloridos estratégicos para criar hierarquia visual e guiar a atenção do usuário através da jornada de descoberta.

## Filosofia de Design

### 🎯 Princípios Fundamentais

#### 1. Monochrome Elegance
```css
:root {
  /* Core Colors */
  --color-black: #000000;
  --color-white: #ffffff;
  --color-gray-900: #1a1a1a;
  --color-gray-800: #2d2d2d;
  --color-gray-700: #404040;
  --color-gray-600: #525252;
  --color-gray-500: #737373;
  --color-gray-400: #a3a3a3;
  --color-gray-300: #d4d4d4;
  --color-gray-200: #e5e5e5;
  --color-gray-100: #f5f5f5;

  /* Accent Colors (Strategic Use Only) */
  --color-blue-500: #3b82f6;      /* Trust, International */
  --color-emerald-500: #10b981;   /* Growth, National */
  --color-purple-500: #8b5cf6;    /* Strategy, Creativity */
  --color-orange-500: #f97316;    /* Innovation, Energy */
  --color-pink-500: #ec4899;      /* Engagement, Performance */
}
```

#### 2. Typography Hierarchy
```css
/* Font Stacks */
.font-primary {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.font-display {
  font-family: 'Caveat', cursive; /* For card titles and playful elements */
}

.font-mono {
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
}

/* Type Scale */
.text-xs   { font-size: 0.75rem; line-height: 1rem; }    /* 12px */
.text-sm   { font-size: 0.875rem; line-height: 1.25rem; } /* 14px */
.text-base { font-size: 1rem; line-height: 1.5rem; }      /* 16px */
.text-lg   { font-size: 1.125rem; line-height: 1.75rem; } /* 18px */
.text-xl   { font-size: 1.25rem; line-height: 1.75rem; }  /* 20px */
.text-2xl  { font-size: 1.5rem; line-height: 2rem; }      /* 24px */
.text-3xl  { font-size: 1.875rem; line-height: 2.25rem; } /* 30px */
.text-4xl  { font-size: 2.25rem; line-height: 2.5rem; }   /* 36px */
```

#### 3. Spacing System
```css
/* Consistent spacing based on 4px grid */
.space-system {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */
}
```

## Componentes Base

### 🔲 Button Component

#### Variants e Estados
```typescript
// apps/web/src/components/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-black text-white hover:bg-gray-900',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-black text-black hover:bg-black hover:text-white',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
        link: 'text-black underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

#### Specialized Buttons
```typescript
// Modal Action Button (Alimentar IA)
const AlimentarButton = ({ onClick, disabled, wordCount }: AlimentarButtonProps) => (
  <Button
    onClick={onClick}
    disabled={disabled || wordCount < 10}
    className="bg-black text-white hover:bg-gray-900 transition-all duration-200 disabled:opacity-50"
  >
    <Database className="w-4 h-4 mr-2" />
    ALIMENTAR
    {wordCount >= 10 && (
      <span className="ml-2 text-xs bg-white text-black px-2 py-1 rounded">
        {wordCount}
      </span>
    )}
  </Button>
);

// Business Card Selection Button
const BusinessCardButton = ({
  data,
  isSelected,
  onSelect,
  gradient
}: BusinessCardButtonProps) => (
  <motion.button
    className={cn(
      'p-6 rounded-lg border-2 transition-all duration-200 text-left',
      'hover:scale-102 hover:shadow-lg',
      isSelected ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
    )}
    onClick={() => onSelect(data.id)}
    whileHover={{ y: -5 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className={cn('w-12 h-12 rounded-lg mb-4 flex items-center justify-center', gradient)}>
      <Icon name={data.icon} className="w-6 h-6 text-white" />
    </div>
    <h3 className="font-semibold text-lg mb-2">{data.title}</h3>
    <p className="text-gray-600 text-sm">{data.description}</p>
  </motion.button>
);
```

### 🎴 Card Component

#### Base Card Structure
```typescript
// apps/web/src/components/ui/Card.tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'game';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-white shadow-sm rounded-lg border',
      bordered: 'bg-white border-2 border-gray-200 rounded-lg',
      elevated: 'bg-white shadow-lg rounded-lg border',
      game: 'bg-transparent border-2 border-white rounded-lg relative overflow-hidden'
    };

    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      />
    );
  }
);

// Game Card Implementation (Journey Cards)
interface GameCardProps {
  title: string;
  position: { x: number; y: number };
  state: 'inactive' | 'active' | 'completed';
  shape: 'rectangular' | 'circular';
  onClick: () => void;
}

const GameCard = ({ title, position, state, shape, onClick }: GameCardProps) => {
  const baseClasses = cn(
    'absolute cursor-pointer transition-all duration-300 flex items-center justify-center',
    'font-display text-lg font-semibold',
    {
      'w-60 h-40 rounded-lg': shape === 'rectangular',
      'w-40 h-40 rounded-full': shape === 'circular'
    }
  );

  const stateClasses = {
    inactive: 'bg-transparent text-white border-2 border-white hover:bg-white hover:text-black',
    active: 'bg-transparent text-white border-2 border-white hover:bg-white hover:text-black',
    completed: 'bg-white text-black border-2 border-black'
  };

  return (
    <motion.div
      className={cn(baseClasses, stateClasses[state])}
      style={{ left: position.x, top: position.y }}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={
        state === 'completed'
          ? {
              y: [0, -10, 0],
              transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }
          : {}
      }
    >
      {shape === 'circular' && (
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 160 160"
        >
          <circle
            cx="80"
            cy="80"
            r="78"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 4"
            className="animate-spin"
            style={{ animationDuration: '20s' }}
          />
        </svg>
      )}
      <span className="relative z-10 text-center px-4">{title}</span>
    </motion.div>
  );
};
```

### 📝 Input Components

#### Text Input with States
```typescript
// apps/web/src/components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helper?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, helper, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-900">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2',
            'text-sm placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {helper && !error && (
          <p className="text-sm text-gray-500">{helper}</p>
        )}
      </div>
    );
  }
);

// ContentEditable Diary Component
const DiaryTextArea = ({
  content,
  onChange,
  onWordCountChange
}: DiaryTextAreaProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;

    const text = editorRef.current.innerText;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const count = text.trim() === '' ? 0 : words.length;

    setWordCount(count);
    onChange(text);
    onWordCountChange(count);
  }, [onChange, onWordCountChange]);

  return (
    <div className="diary-container bg-gray-900 rounded-lg p-6">
      <div
        ref={editorRef}
        contentEditable
        className={cn(
          'min-h-80 bg-gray-800 rounded p-4 text-white',
          'focus:outline-none focus:ring-2 focus:ring-white',
          'whitespace-pre-wrap font-mono text-sm leading-relaxed'
        )}
        onInput={handleInput}
        style={{
          backgroundImage: 'linear-gradient(transparent 23px, rgba(255,255,255,0.1) 23px)',
          backgroundSize: '24px 24px',
          paddingTop: '24px'
        }}
        suppressContentEditableWarning
      />
      <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
        <span>Palavras: {wordCount}</span>
        <span>Tempo de leitura: {Math.ceil(wordCount / 250)} min</span>
      </div>
    </div>
  );
};
```

### 🎭 Modal Components

#### Base Modal Structure
```typescript
// apps/web/src/components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnBackdrop = true
}: ModalProps) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-none w-full h-full'
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={closeOnBackdrop ? onClose : undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal Content */}
        <motion.div
          className={cn(
            'relative bg-white rounded-lg shadow-2xl overflow-hidden',
            'max-h-[90vh] overflow-y-auto',
            sizeClasses[size]
          )}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Specialized Modal Layouts
const SplitModal = ({
  leftContent,
  rightContent,
  leftBg = 'black',
  rightBg = 'white'
}: SplitModalProps) => (
  <div className="flex w-full h-full min-h-96">
    <div className={`flex-1 p-8 ${leftBg === 'black' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {leftContent}
    </div>
    <div className={`flex-1 p-8 ${rightBg === 'white' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      {rightContent}
    </div>
  </div>
);
```

## Animações e Microinterações

### 🎬 Animation Presets

#### Standard Animations
```typescript
// apps/web/src/lib/animations.ts
export const animations = {
  // Modal animations
  modalEnter: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },

  // Card animations
  cardAppear: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] }
  },

  // Hover animations
  cardHover: {
    whileHover: { scale: 1.02, y: -5 },
    transition: { duration: 0.2 }
  },

  // Loading animations
  pulse: {
    animate: { opacity: [1, 0.5, 1] },
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
  },

  // Success animations
  celebration: {
    animate: { scale: [1, 1.05, 1] },
    transition: { duration: 0.3, ease: 'easeOut' }
  }
} as const;

// Custom easing functions
export const easings = {
  professional: [0.23, 1, 0.32, 1],
  bouncy: [0.68, -0.55, 0.265, 1.55],
  smooth: [0.4, 0, 0.2, 1],
  sharp: [0.4, 0, 0.6, 1]
} as const;
```

#### Staggered Animations
```typescript
// Staggered card entrance
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300
    }
  }
};

const BusinessCardGrid = ({ cards }: BusinessCardGridProps) => (
  <motion.div
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    variants={containerVariants}
    initial="hidden"
    animate="show"
  >
    {cards.map((card) => (
      <motion.div
        key={card.id}
        variants={cardVariants}
      >
        <BusinessCard data={card} />
      </motion.div>
    ))}
  </motion.div>
);
```

## Layout e Grid System

### 📐 Grid Utilities
```css
/* Custom grid layouts */
.journey-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.modal-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 500px;
}

.card-progression {
  display: flex;
  gap: 420px;
  overflow-x: auto;
  padding: 0 100px;
  scroll-behavior: smooth;
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  .modal-split {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }

  .card-progression {
    gap: 250px;
    padding: 0 20px;
  }
}
```

## Accessibility

### ♿ A11y Guidelines

#### Focus Management
```css
/* Focus styles */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black;
}

.focus-ring-inset {
  @apply focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white;
}

/* High contrast support */
@media (prefers-contrast: high) {
  .button {
    border: 2px solid currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Screen Reader Support
```typescript
// ARIA labels and descriptions
const AccessibleButton = ({
  children,
  ariaLabel,
  ariaDescribedBy,
  ...props
}: AccessibleButtonProps) => (
  <Button
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    {...props}
  >
    {children}
  </Button>
);

// Live regions for dynamic content
const LiveRegion = ({
  message,
  politeness = 'polite'
}: LiveRegionProps) => (
  <div
    aria-live={politeness}
    aria-atomic="true"
    className="sr-only"
  >
    {message}
  </div>
);
```

## Performance Optimizations

### ⚡ CSS Performance
```css
/* Hardware acceleration */
.accelerated {
  will-change: transform;
  transform: translateZ(0);
}

/* Efficient animations */
@keyframes slideUp {
  from {
    transform: translate3d(0, 100%, 0);
    opacity: 0;
  }
  to {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}

/* Critical CSS inlining */
.critical-above-fold {
  contain: layout style paint;
}

/* Lazy loading for non-critical styles */
.lazy-styles {
  content-visibility: auto;
  contain-intrinsic-size: 200px;
}
```

O design system do MadBoat v3 combina elegância minimalista com funcionalidade robusta, criando uma experiência visual coesa que suporta a jornada gamificada do usuário através de componentes reutilizáveis, performáticos e acessíveis.