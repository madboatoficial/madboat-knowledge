# ⚛️ Padrões React - MadBoat v3

## Visão Geral

O MadBoat v3 utiliza React 19 com Next.js 15, aproveitando as mais recentes funcionalidades como Actions, Server Components, e novas APIs de concorrência. Este documento define os padrões e best practices para desenvolvimento React no projeto.

## React 19 Features

### 🚀 React Actions Pattern

#### Server Actions
```typescript
// apps/web/src/actions/auth-actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

export async function signUpAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult<UserProfile>> {
  const supabase = createServerActionClient({ cookies });

  // Validate form data
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;

  // Validation
  const result = SignUpSchema.safeParse({ email, password, fullName });
  if (!result.success) {
    return {
      success: false,
      errors: formatZodErrors(result.error)
    };
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: {
          full_name: result.data.fullName
        }
      }
    });

    if (authError) {
      return {
        success: false,
        error: authError.message
      };
    }

    // Create user profile
    if (authData.user) {
      await createUserProfile(authData.user);
    }

    return {
      success: true,
      data: authData.user,
      message: 'Account created successfully! Check your email to verify.'
    };
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

// Usage in component
function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, null);

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <input name="fullName" type="text" required />
      <button type="submit" disabled={pending}>
        {pending ? 'Creating account...' : 'Sign Up'}
      </button>
      {state?.error && <div className="error">{state.error}</div>}
    </form>
  );
}
```

#### Client Actions
```typescript
// apps/web/src/actions/modal-actions.ts
'use client';

import { useTransition } from 'react';

interface SubmitStoryAction {
  story: string;
  skill: string;
}

export function useStorySubmission() {
  const [isPending, startTransition] = useTransition();

  const submitStory = (data: SubmitStoryAction) => {
    startTransition(async () => {
      try {
        // Optimistic update
        updateUIOptimistically(data);

        // Server call
        const result = await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!result.ok) {
          throw new Error('Failed to submit story');
        }

        const response = await result.json();

        // Update with real data
        updateUIWithServerData(response);

        // Trigger card progression
        triggerCardProgression();

      } catch (error) {
        // Revert optimistic update
        revertOptimisticUpdate();
        showErrorMessage(error.message);
      }
    });
  };

  return {
    submitStory,
    isPending
  };
}
```

### 🔄 Server Components Pattern

#### Layout Server Components
```typescript
// apps/web/src/app/layout.tsx
import { Inter } from 'next/font/google';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { AuthProvider } from '@/components/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });

  // Server-side session check
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return (
    <html lang="en" className={inter.className}>
      <body>
        <AuthProvider session={session}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

#### Data Fetching Server Components
```typescript
// apps/web/src/app/control/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import { ControlDashboard } from '@/components/ControlDashboard';

export default async function ControlPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  // Fetch user data server-side
  const [userProfile, userStories, journeyProgress] = await Promise.all([
    fetchUserProfile(session.user.id),
    fetchUserStories(session.user.id),
    fetchJourneyProgress(session.user.id)
  ]);

  return (
    <ControlDashboard
      user={session.user}
      profile={userProfile}
      stories={userStories}
      progress={journeyProgress}
    />
  );
}

// Streaming with Suspense
export default async function ControlPageStreaming() {
  return (
    <div>
      <Suspense fallback={<DashboardSkeleton />}>
        <ControlDashboard />
      </Suspense>
      <Suspense fallback={<StoriesSkeleton />}>
        <UserStories />
      </Suspense>
    </div>
  );
}
```

## Component Patterns

### 🧩 Compound Component Pattern

#### Modal System Implementation
```typescript
// apps/web/src/components/modals/Modal.tsx
interface ModalContextValue {
  isOpen: boolean;
  close: () => void;
  data: any;
}

const ModalContext = createContext<ModalContextValue | null>(null);

// Main Modal component
function Modal({
  children,
  isOpen,
  onClose,
  data
}: ModalProps) {
  const contextValue: ModalContextValue = {
    isOpen,
    close: onClose,
    data
  };

  if (!isOpen) return null;

  return (
    <ModalContext.Provider value={contextValue}>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
}

// Compound components
Modal.Header = function ModalHeader({
  children,
  showClose = true
}: ModalHeaderProps) {
  const { close } = useModalContext();

  return (
    <div className="modal-header">
      {children}
      {showClose && (
        <button onClick={close} className="modal-close">
          <X size={24} />
        </button>
      )}
    </div>
  );
};

Modal.Body = function ModalBody({
  children,
  className
}: ModalBodyProps) {
  return (
    <div className={cn('modal-body', className)}>
      {children}
    </div>
  );
};

Modal.Footer = function ModalFooter({
  children,
  align = 'right'
}: ModalFooterProps) {
  return (
    <div className={cn('modal-footer', `justify-${align}`)}>
      {children}
    </div>
  );
};

// Usage
function DiscoveryModal({ isOpen, onClose }: DiscoveryModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header>
        <h2>Quem sou eu na era da IA?</h2>
      </Modal.Header>
      <Modal.Body>
        <StoryInputForm />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleSubmit}>
          Alimentar IA
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

### 🎮 State Management Patterns

#### Context + Reducer Pattern
```typescript
// apps/web/src/contexts/GameModalContext.tsx
import { createContext, useContext, useReducer, type ReactNode } from 'react';

// State definition
interface GameModalState {
  currentStep: number;
  storySubmitted: boolean;
  businessTypeSelected: BusinessTypeId | null;
  userSkill: string | null;
  userStory: string | null;
  modalData: Record<string, unknown>;
}

// Actions
type GameModalAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'SUBMIT_STORY'; payload: { story: string; skill: string } }
  | { type: 'SELECT_BUSINESS_TYPE'; payload: { typeId: BusinessTypeId } }
  | { type: 'UPDATE_MODAL_DATA'; payload: { key: string; value: unknown } }
  | { type: 'RESET' };

// Reducer
function gameModalReducer(
  state: GameModalState,
  action: GameModalAction
): GameModalState {
  switch (action.type) {
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, MAX_STEPS)
      };

    case 'SUBMIT_STORY':
      return {
        ...state,
        storySubmitted: true,
        userStory: action.payload.story,
        userSkill: action.payload.skill,
        currentStep: state.currentStep + 1
      };

    case 'SELECT_BUSINESS_TYPE':
      return {
        ...state,
        businessTypeSelected: action.payload.typeId
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// Context
interface GameModalContextValue {
  state: GameModalState;
  dispatch: React.Dispatch<GameModalAction>;

  // Computed values
  canProceed: boolean;
  unlockedCards: number[];
  progressPercentage: number;

  // Actions
  nextStep: () => void;
  submitStory: (story: string, skill: string) => void;
  selectBusinessType: (typeId: BusinessTypeId) => void;
  reset: () => void;
}

const GameModalContext = createContext<GameModalContextValue | null>(null);

// Provider
export function GameModalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameModalReducer, initialState);

  // Computed values
  const canProceed = useMemo(() => {
    return state.storySubmitted && state.userSkill !== null;
  }, [state.storySubmitted, state.userSkill]);

  const unlockedCards = useMemo(() => {
    const cards = [1]; // Card 1 always unlocked
    if (state.storySubmitted) cards.push(2);
    if (state.businessTypeSelected) cards.push(3);
    return cards;
  }, [state.storySubmitted, state.businessTypeSelected]);

  // Actions
  const actions = useMemo(() => ({
    nextStep: () => dispatch({ type: 'NEXT_STEP' }),
    submitStory: (story: string, skill: string) =>
      dispatch({ type: 'SUBMIT_STORY', payload: { story, skill } }),
    selectBusinessType: (typeId: BusinessTypeId) =>
      dispatch({ type: 'SELECT_BUSINESS_TYPE', payload: { typeId } }),
    reset: () => dispatch({ type: 'RESET' })
  }), []);

  const contextValue: GameModalContextValue = {
    state,
    dispatch,
    canProceed,
    unlockedCards,
    progressPercentage: (state.currentStep / MAX_STEPS) * 100,
    ...actions
  };

  return (
    <GameModalContext.Provider value={contextValue}>
      {children}
    </GameModalContext.Provider>
  );
}

// Hook
export function useGameModal(): GameModalContextValue {
  const context = useContext(GameModalContext);
  if (!context) {
    throw new Error('useGameModal must be used within GameModalProvider');
  }
  return context;
}
```

### 🎨 Render Props Pattern

#### Animation Controller
```typescript
// apps/web/src/components/animations/AnimationController.tsx
interface AnimationRenderProps {
  isAnimating: boolean;
  startAnimation: () => void;
  stopAnimation: () => void;
  progress: number;
  phase: AnimationPhase;
}

interface AnimationControllerProps {
  duration: number;
  phases?: AnimationPhase[];
  autoStart?: boolean;
  loop?: boolean;
  children: (props: AnimationRenderProps) => ReactNode;
}

export function AnimationController({
  duration,
  phases = ['enter', 'active', 'exit'],
  autoStart = false,
  loop = false,
  children
}: AnimationControllerProps) {
  const [isAnimating, setIsAnimating] = useState(autoStart);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<AnimationPhase>('idle');

  const animationRef = useRef<number>();

  const startAnimation = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setProgress(0);
    setCurrentPhase('enter');

    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const newProgress = Math.min(elapsed / duration, 1);

      setProgress(newProgress);

      // Update phase based on progress
      if (newProgress < 0.1) {
        setCurrentPhase('enter');
      } else if (newProgress < 0.9) {
        setCurrentPhase('active');
      } else {
        setCurrentPhase('exit');
      }

      if (newProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setCurrentPhase('idle');

        if (loop) {
          setTimeout(startAnimation, 100);
        }
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [duration, isAnimating, loop]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsAnimating(false);
    setProgress(0);
    setCurrentPhase('idle');
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      {children({
        isAnimating,
        startAnimation,
        stopAnimation,
        progress,
        phase: currentPhase
      })}
    </>
  );
}

// Usage
function CardAppearanceAnimation({ onComplete }: { onComplete: () => void }) {
  return (
    <AnimationController duration={2000}>
      {({ isAnimating, progress, phase, startAnimation }) => (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: phase === 'enter' ? progress * 0.5 :
                   phase === 'active' ? 0.5 + (progress * 0.5) : 1,
            opacity: progress
          }}
          onAnimationComplete={onComplete}
          onClick={startAnimation}
        >
          <BusinessCard />
        </motion.div>
      )}
    </AnimationController>
  );
}
```

## Performance Patterns

### ⚡ Optimization Strategies

#### React.memo with Custom Comparison
```typescript
// Smart memoization for complex props
interface BusinessCardProps {
  data: BusinessCardData;
  isSelected: boolean;
  onSelect: (id: BusinessTypeId) => void;
  animationState: AnimationState;
}

const BusinessCard = React.memo<BusinessCardProps>(
  function BusinessCard({ data, isSelected, onSelect, animationState }) {
    const handleClick = useCallback(() => {
      onSelect(data.id);
    }, [data.id, onSelect]);

    return (
      <motion.div
        className={cn('business-card', { selected: isSelected })}
        onClick={handleClick}
        animate={animationState}
      >
        <Icon name={data.icon} />
        <h3>{data.title}</h3>
        <p>{data.description}</p>
      </motion.div>
    );
  },
  // Custom comparison function
  (prevProps, nextProps) => {
    return (
      prevProps.data.id === nextProps.data.id &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.animationState.type === nextProps.animationState.type &&
      prevProps.onSelect === nextProps.onSelect
    );
  }
);
```

#### useMemo and useCallback Optimization
```typescript
// Expensive calculations
function useCardProgression(userProgress: UserProgress) {
  const unlockedCards = useMemo(() => {
    return calculateUnlockedCards(userProgress);
  }, [userProgress.storySubmitted, userProgress.businessTypeSelected]);

  const nextCard = useMemo(() => {
    return determineNextCard(unlockedCards, userProgress);
  }, [unlockedCards, userProgress.currentStep]);

  const progressPercentage = useMemo(() => {
    return (unlockedCards.length / TOTAL_CARDS) * 100;
  }, [unlockedCards.length]);

  return {
    unlockedCards,
    nextCard,
    progressPercentage
  };
}

// Stable callbacks
function useStableHandlers(dispatch: GameModalDispatch) {
  const submitStory = useCallback(
    (story: string, skill: string) => {
      dispatch({ type: 'SUBMIT_STORY', payload: { story, skill } });
    },
    [dispatch]
  );

  const selectBusinessType = useCallback(
    (typeId: BusinessTypeId) => {
      dispatch({ type: 'SELECT_BUSINESS_TYPE', payload: { typeId } });
    },
    [dispatch]
  );

  return {
    submitStory,
    selectBusinessType
  };
}
```

#### Virtual Scrolling for Large Lists
```typescript
// Virtual scrolling implementation
import { FixedSizeList as List } from 'react-window';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: CSSProperties; data: T }) => ReactNode;
}

function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem
}: VirtualListProps<T>) {
  const Row = useCallback(
    ({ index, style }: { index: number; style: CSSProperties }) => {
      return renderItem({ index, style, data: items[index] });
    },
    [items, renderItem]
  );

  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      itemData={items}
    >
      {Row}
    </List>
  );
}

// Usage for story list
function UserStoriesList({ stories }: { stories: Story[] }) {
  const renderStoryItem = useCallback(
    ({ index, style, data }: { index: number; style: CSSProperties; data: Story }) => (
      <div style={style} className="story-item">
        <h4>{data.title}</h4>
        <p>{data.excerpt}</p>
        <time>{formatDate(data.createdAt)}</time>
      </div>
    ),
    []
  );

  return (
    <VirtualList
      items={stories}
      height={600}
      itemHeight={120}
      renderItem={renderStoryItem}
    />
  );
}
```

## Testing Patterns

### 🧪 Component Testing

#### Test Utilities and Setup
```typescript
// apps/web/src/test/utils.tsx
import { render, type RenderOptions } from '@testing-library/react';
import { GameModalProvider } from '@/contexts/GameModalContext';

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <GameModalProvider>
      {children}
    </GameModalProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock factories
export const createMockUser = (overrides?: Partial<UserProfile>): UserProfile => ({
  id: 'test-user-id' as UserId,
  fullName: 'Test User',
  email: 'test@example.com',
  avatarUrl: null,
  onboardingCompleted: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides
});

export const createMockStory = (overrides?: Partial<Story>): Story => ({
  id: 'test-story-id' as StoryId,
  userId: 'test-user-id' as UserId,
  title: 'Test Story',
  content: 'This is a test story with more than 10 words to pass validation.',
  skill: 'Testing',
  wordCount: 12,
  createdAt: new Date('2025-01-01'),
  ...overrides
});
```

#### Component Test Examples
```typescript
// apps/web/src/components/__tests__/BusinessCard.test.tsx
import { render, screen, fireEvent } from '@/test/utils';
import { BusinessCard } from '../BusinessCard';

describe('BusinessCard', () => {
  const mockBusinessData = {
    id: 'entrepreneur-br' as BusinessTypeId,
    title: 'Empresário que mora no Brasil',
    description: 'Empresa nacional com visão de crescimento',
    icon: 'Briefcase',
    gradient: 'emerald'
  };

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders business card with correct data', () => {
    render(
      <BusinessCard
        data={mockBusinessData}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    expect(screen.getByText(mockBusinessData.title)).toBeInTheDocument();
    expect(screen.getByText(mockBusinessData.description)).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    render(
      <BusinessCard
        data={mockBusinessData}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockBusinessData.id);
  });

  it('shows selected state correctly', () => {
    render(
      <BusinessCard
        data={mockBusinessData}
        onSelect={mockOnSelect}
        isSelected={true}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveClass('selected');
  });
});
```

#### Hook Testing
```typescript
// apps/web/src/hooks/__tests__/useGameModal.test.tsx
import { renderHook, act } from '@testing-library/react';
import { GameModalProvider, useGameModal } from '@/contexts/GameModalContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GameModalProvider>{children}</GameModalProvider>
);

describe('useGameModal', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useGameModal(), { wrapper });

    expect(result.current.state.storySubmitted).toBe(false);
    expect(result.current.state.currentStep).toBe(1);
    expect(result.current.unlockedCards).toEqual([1]);
  });

  it('updates state when story is submitted', () => {
    const { result } = renderHook(() => useGameModal(), { wrapper });

    act(() => {
      result.current.submitStory('Test story with more than ten words', 'Testing');
    });

    expect(result.current.state.storySubmitted).toBe(true);
    expect(result.current.state.userStory).toBe('Test story with more than ten words');
    expect(result.current.state.userSkill).toBe('Testing');
    expect(result.current.unlockedCards).toEqual([1, 2]);
  });

  it('calculates progress correctly', () => {
    const { result } = renderHook(() => useGameModal(), { wrapper });

    act(() => {
      result.current.submitStory('Test story', 'Testing');
    });

    act(() => {
      result.current.selectBusinessType('entrepreneur-br' as BusinessTypeId);
    });

    expect(result.current.progressPercentage).toBeGreaterThan(0);
    expect(result.current.canProceed).toBe(true);
  });
});
```

Os padrões React do MadBoat v3 garantem código maintível, performático e testável, aproveitando ao máximo as funcionalidades mais recentes do React 19 enquanto mantém compatibilidade e boas práticas de desenvolvimento.