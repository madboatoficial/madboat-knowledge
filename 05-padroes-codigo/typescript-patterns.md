# 🎯 Padrões TypeScript - MadBoat v3

## Visão Geral

O MadBoat v3 utiliza TypeScript em **modo estrito** em todos os workspaces, priorizando type safety, maintainability e developer experience. Este documento define os padrões, convenções e best practices para desenvolvimento TypeScript no projeto.

## Configuração TypeScript Strict

### 📋 tsconfig.json Base
```json
{
  "compilerOptions": {
    // Strict Type Checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,

    // Module Resolution
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,

    // Emit
    "noEmit": true,
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "module": "ESNext",
    "jsx": "preserve",
    "incremental": true,

    // Path Mapping
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["src/**/*", "next-env.d.ts"],
  "exclude": ["node_modules", ".next", "dist"]
}
```

### 🎯 Strict Mode Benefits
- **Zero `any` tolerance**: Todos os tipos devem ser explícitos
- **Null safety**: Proteção contra null/undefined errors
- **Type exhaustiveness**: Switch cases e union types completos
- **Property initialization**: Garantia de inicialização de propriedades
- **Function type safety**: Parâmetros e retornos type-safe

## Patterns de Tipos

### 🏗️ Interface Design Patterns

#### Base Interface Pattern
```typescript
// Base interface com campos comuns
interface BaseEntity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// Extending interfaces
interface UserProfile extends BaseEntity {
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
}

// Composition over inheritance quando apropriado
interface WithTimestamps {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

interface WithMetadata {
  metadata: Record<string, unknown>;
}

type UserWithMeta = UserProfile & WithMetadata;
```

#### Branded Types Pattern
```typescript
// Create type-safe IDs
type UserId = string & { readonly brand: unique symbol };
type StoryId = string & { readonly brand: unique symbol };
type BusinessTypeId = string & { readonly brand: unique symbol };

// Type guards
function isUserId(value: string): value is UserId {
  return /^[0-9a-f-]{36}$/.test(value); // UUID format
}

// Usage
function getUserProfile(id: UserId): Promise<UserProfile> {
  // Type-safe - can't accidentally pass StoryId
  return fetchProfile(id);
}
```

### 🎭 Union Types e Discriminated Unions

#### Modal State Pattern
```typescript
// Discriminated union for modal states
type ModalState =
  | { type: 'closed' }
  | { type: 'loading'; modalType: ModalType }
  | {
      type: 'open';
      modalType: ModalType;
      data: ModalData;
      closable: boolean;
    }
  | { type: 'error'; error: Error; retryable: boolean };

// Type-safe state handling
function handleModalState(state: ModalState): JSX.Element {
  switch (state.type) {
    case 'closed':
      return null;

    case 'loading':
      return <ModalSkeleton type={state.modalType} />;

    case 'open':
      return (
        <Modal
          type={state.modalType}
          data={state.data}
          closable={state.closable}
        />
      );

    case 'error':
      return (
        <ErrorModal
          error={state.error}
          retryable={state.retryable}
        />
      );

    default:
      // TypeScript will error if we don't handle all cases
      const _exhaustive: never = state;
      return _exhaustive;
  }
}
```

#### API Response Pattern
```typescript
// Generic API response wrapper
interface ApiSuccess<T> {
  success: true;
  data: T;
  metadata?: {
    total?: number;
    page?: number;
    hasMore?: boolean;
  };
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Type guards
function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success;
}

// Usage
async function fetchUserStories(userId: UserId): Promise<Story[]> {
  const response = await api.get<ApiResponse<Story[]>>(`/users/${userId}/stories`);

  if (isApiSuccess(response)) {
    return response.data;
  }

  throw new ApiError(response.error.message, response.error.code);
}
```

### 🔧 Utility Types e Transformações

#### Advanced Utility Types
```typescript
// Utility types for common transformations
type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Form data patterns
type CreateUserData = OptionalExcept<
  UserProfile,
  'email' | 'fullName'
>; // email and fullName required

type UpdateUserData = Partial<
  Pick<UserProfile, 'fullName' | 'avatarUrl' | 'metadata'>
>;

// Event payload patterns
type UserEvent<T extends string, P = Record<string, never>> = {
  type: T;
  userId: UserId;
  timestamp: Date;
  payload: P;
};

type StorySubmittedEvent = UserEvent<
  'story_submitted',
  {
    storyId: StoryId;
    wordCount: number;
    skill: string;
  }
>;
```

#### Configuration Types
```typescript
// Environment-specific configuration
interface BaseConfig {
  readonly appName: string;
  readonly version: string;
  readonly environment: 'development' | 'staging' | 'production';
}

interface DatabaseConfig {
  readonly url: string;
  readonly poolSize: number;
  readonly ssl: boolean;
}

interface AuthConfig {
  readonly providers: readonly ('google' | 'github' | 'apple')[];
  readonly sessionDuration: number;
  readonly refreshThreshold: number;
}

// Compose full config
type AppConfig = BaseConfig & {
  readonly database: DatabaseConfig;
  readonly auth: AuthConfig;
  readonly stripe: StripeConfig;
  readonly features: FeatureFlags;
};

// Environment validation
function validateConfig(config: unknown): asserts config is AppConfig {
  // Runtime validation logic
  if (!isValidConfig(config)) {
    throw new Error('Invalid configuration');
  }
}
```

## React Patterns com TypeScript

### ⚛️ Component Patterns

#### Generic Component Pattern
```typescript
// Generic props with constraints
interface BaseCardProps<T> {
  data: T;
  onSelect: (item: T) => void;
  className?: string;
  disabled?: boolean;
}

// Specific implementations
interface BusinessCardData {
  id: BusinessTypeId;
  title: string;
  description: string;
  icon: string;
  gradient: string;
}

type BusinessCardProps = BaseCardProps<BusinessCardData>;

function BusinessCard({ data, onSelect, className, disabled }: BusinessCardProps) {
  return (
    <div
      className={cn('business-card', className)}
      onClick={() => !disabled && onSelect(data)}
    >
      <Icon name={data.icon} />
      <h3>{data.title}</h3>
      <p>{data.description}</p>
    </div>
  );
}
```

#### Hook Patterns
```typescript
// Custom hook with proper typing
interface UseModalSystemOptions {
  defaultOpen?: boolean;
  onClose?: () => void;
  preventClose?: boolean;
}

interface UseModalSystemReturn {
  isOpen: boolean;
  currentModal: ModalType | null;
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
  modalData: ModalData | null;
}

function useModalSystem(options: UseModalSystemOptions = {}): UseModalSystemReturn {
  const [state, setState] = useState<ModalState>({ type: 'closed' });

  const openModal = useCallback((type: ModalType, data?: ModalData) => {
    setState({
      type: 'open',
      modalType: type,
      data: data ?? null,
      closable: !options.preventClose
    });
  }, [options.preventClose]);

  const closeModal = useCallback(() => {
    if (state.type === 'open' && !state.closable) {
      return; // Prevent closing if not closable
    }

    setState({ type: 'closed' });
    options.onClose?.();
  }, [state, options.onClose]);

  return {
    isOpen: state.type === 'open',
    currentModal: state.type === 'open' ? state.modalType : null,
    openModal,
    closeModal,
    modalData: state.type === 'open' ? state.data : null
  };
}
```

#### Context Pattern with TypeScript
```typescript
// Strongly typed context
interface GameModalContextValue {
  // State
  storySubmitted: boolean;
  businessTypeSelected: BusinessTypeId | null;
  userSkill: string | null;

  // Actions
  submitStory: (story: string, skill: string) => Promise<void>;
  selectBusinessType: (typeId: BusinessTypeId) => void;
  resetProgress: () => void;

  // Computed values
  unlockedCards: number[];
  canProceedToNext: boolean;
}

const GameModalContext = createContext<GameModalContextValue | null>(null);

// Type-safe hook
function useGameModal(): GameModalContextValue {
  const context = useContext(GameModalContext);

  if (!context) {
    throw new Error('useGameModal must be used within GameModalProvider');
  }

  return context;
}

// Provider with reducer pattern
type GameModalAction =
  | { type: 'STORY_SUBMITTED'; payload: { story: string; skill: string } }
  | { type: 'BUSINESS_TYPE_SELECTED'; payload: { typeId: BusinessTypeId } }
  | { type: 'RESET_PROGRESS' };

interface GameModalState {
  storySubmitted: boolean;
  businessTypeSelected: BusinessTypeId | null;
  userSkill: string | null;
  userStory: string | null;
}

function gameModalReducer(
  state: GameModalState,
  action: GameModalAction
): GameModalState {
  switch (action.type) {
    case 'STORY_SUBMITTED':
      return {
        ...state,
        storySubmitted: true,
        userStory: action.payload.story,
        userSkill: action.payload.skill
      };

    case 'BUSINESS_TYPE_SELECTED':
      return {
        ...state,
        businessTypeSelected: action.payload.typeId
      };

    case 'RESET_PROGRESS':
      return {
        storySubmitted: false,
        businessTypeSelected: null,
        userSkill: null,
        userStory: null
      };

    default:
      return state;
  }
}
```

## Error Handling Patterns

### 🚨 Type-Safe Error Handling

#### Custom Error Classes
```typescript
// Base error class
abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  readonly timestamp: Date = new Date();

  constructor(
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

// Specific error types
class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;

  constructor(
    field: string,
    value: unknown,
    constraint: string,
    context?: Record<string, unknown>
  ) {
    super(`Validation failed for field '${field}': ${constraint}`, {
      field,
      value,
      constraint,
      ...context
    });
  }
}

class AuthenticationError extends AppError {
  readonly code = 'AUTHENTICATION_ERROR';
  readonly statusCode = 401;
}

class BusinessLogicError extends AppError {
  readonly code = 'BUSINESS_LOGIC_ERROR';
  readonly statusCode = 422;
}
```

#### Result Pattern
```typescript
// Result type for error handling
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Helper functions
function Ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

function Err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

// Usage in business logic
async function submitUserStory(
  userId: UserId,
  story: string,
  skill: string
): Promise<Result<StorySubmissionResult, ValidationError | BusinessLogicError>> {
  // Validation
  if (story.trim().length < 10) {
    return Err(
      new ValidationError('story', story, 'Must be at least 10 characters')
    );
  }

  if (!skill.trim()) {
    return Err(
      new ValidationError('skill', skill, 'Skill is required')
    );
  }

  try {
    // Business logic
    const result = await storyService.submit({
      userId,
      story: story.trim(),
      skill: skill.trim(),
      submittedAt: new Date()
    });

    return Ok(result);
  } catch (error) {
    if (error instanceof BusinessLogicError) {
      return Err(error);
    }

    // Re-throw unexpected errors
    throw error;
  }
}
```

## Validation Patterns

### 🛡️ Schema Validation com Zod

#### Schema Definition
```typescript
import { z } from 'zod';

// Base schemas
const UserIdSchema = z.string().uuid().brand<'UserId'>();
const TimestampSchema = z.date().or(z.string().datetime());

// User schemas
const UserProfileSchema = z.object({
  id: UserIdSchema,
  fullName: z.string().nullable(),
  email: z.string().email(),
  avatarUrl: z.string().url().nullable(),
  onboardingCompleted: z.boolean(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema
});

// Form schemas
const StorySubmissionSchema = z.object({
  story: z
    .string()
    .min(10, 'Story must be at least 10 characters')
    .max(5000, 'Story cannot exceed 5000 characters'),
  skill: z
    .string()
    .min(3, 'Skill must be at least 3 characters')
    .max(100, 'Skill cannot exceed 100 characters')
});

const BusinessTypeSelectionSchema = z.object({
  businessTypeId: z.string().uuid(),
  additionalInfo: z.string().optional()
});

// Type inference
type UserProfile = z.infer<typeof UserProfileSchema>;
type StorySubmission = z.infer<typeof StorySubmissionSchema>;
type BusinessTypeSelection = z.infer<typeof BusinessTypeSelectionSchema>;
```

#### Validation Utilities
```typescript
// Safe parsing utility
function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Result<T, z.ZodError> {
  const result = schema.safeParse(data);

  if (result.success) {
    return Ok(result.data);
  }

  return Err(result.error);
}

// Form validation hook
function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(
    (data: unknown): data is T => {
      const result = safeParse(schema, data);

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          const path = err.path.join('.');
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
        return false;
      }

      setErrors({});
      return true;
    },
    [schema]
  );

  return { errors, validate, clearErrors: () => setErrors({}) };
}
```

## Performance Patterns

### ⚡ Type-Safe Performance Optimization

#### Memoization Patterns
```typescript
// Typed memo hook
function useTypedMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

// Callback memoization with proper typing
interface UseStableCallbackOptions {
  leading?: boolean;
  trailing?: boolean;
}

function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  options: UseStableCallbackOptions = {}
): T {
  const { leading = true, trailing = true } = options;

  // Implementation with proper type preservation
  return useCallback(callback, deps) as T;
}
```

#### Lazy Loading Types
```typescript
// Component lazy loading with proper types
const LazyBusinessModal = lazy(
  () => import('@/components/modals/BusinessModal')
);

// Preload utility with types
function preloadComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): Promise<T> {
  return importFn().then((module) => module.default);
}

// Usage
const preloadBusinessModal = () =>
  preloadComponent(() => import('@/components/modals/BusinessModal'));
```

## Testing Patterns

### 🧪 Type-Safe Testing

#### Test Utilities
```typescript
// Type-safe test data factories
interface CreateUserOptions {
  overrides?: Partial<UserProfile>;
  relations?: {
    stories?: Story[];
    timeline?: TimelineEvent[];
  };
}

function createMockUser(options: CreateUserOptions = {}): UserProfile {
  const base: UserProfile = {
    id: 'test-user-id' as UserId,
    fullName: 'Test User',
    email: 'test@example.com',
    avatarUrl: null,
    onboardingCompleted: false,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  };

  return { ...base, ...options.overrides };
}

// Type-safe mock functions
function createMockModalSystem(): jest.Mocked<UseModalSystemReturn> {
  return {
    isOpen: false,
    currentModal: null,
    openModal: jest.fn(),
    closeModal: jest.fn(),
    modalData: null
  };
}
```

O MadBoat v3 utiliza estes padrões TypeScript para garantir código type-safe, maintível e performático em toda a aplicação, proporcionando uma experiência de desenvolvimento superior e reduzindo significativamente bugs em produção.