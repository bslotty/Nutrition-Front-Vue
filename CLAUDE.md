# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a nutrition tracking application with a Vue 3 + TypeScript frontend and PHP backend. Users can track foods, recipes, meals, exercises, and weight measurements with full nutritional analysis.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (hot reload)
npm run dev

# Type check
npm run type-check

# Build for production (includes type checking)
npm run build

# Build only (skip type checking)
npm run build-only

# Preview production build
npm run preview
```

## Architecture

### Frontend Architecture (Vue 3 + TypeScript)

The frontend uses a **module-based architecture** where each domain is self-contained in `src/modules/`:

```
src/modules/
├── core/          # Shared components, models, utilities
├── food/          # Food management
├── recipes/       # Recipe management
├── intake/        # Meal tracking
├── exercise/      # Exercise tracking
└── weight/        # Weight tracking
```

Each module follows this structure:
- **models/** - Domain models and business logic
- **data/** - Pinia stores and API services
- **chunks/** - Page-level components (list/details views)
- **components/** - Reusable UI components
- **dialogs/** - Modal dialogs
- **enums/** - TypeScript enums

### Backend Architecture (PHP + MySQL)

Located in `api/`, the backend uses a simple MVC pattern:

- **controller.php** - Single entry point routing all requests
- **models/** - Domain models mirroring frontend structure
- **sql.php** - Database connection and query builder
- **response.php** - Standard response format

All API requests go through `controller.php` with this format:
```json
{
  "action": "list|detail|create|update|delete",
  "type": "Foods|Recipes|Meals|Exercises|Weight",
  "object": { ... }
}
```

### Key Design Patterns

#### 1. BaseService Pattern (Frontend)
All data services extend `BaseService` which provides standard CRUD operations. Services handle:
- API communication via `ServerRequest`
- Response parsing and error handling
- Type-specific serialization/deserialization

Example: `FoodService`, `RecipeService`, `MealService`

#### 2. Store Pattern (Pinia)
Each domain has a Pinia store following this pattern:
```typescript
export const useFoodStore = defineStore("foods", () => {
  let food$ = new FoodService();
  let list: Ref<Food[]> = ref([]);

  function getList(forceRefresh = false): Promise<void> {
    // In-memory caching - only fetch if list is empty or forceRefresh is true
    if (list.value.length > 0 && !forceRefresh) {
      return Promise.resolve();
    }
    return food$.getListFromServer().then((l) => {
      list.value = l;
    });
  }

  return { list, getList, food$ };
});
```

**IMPORTANT**: All stores implement in-memory caching. Always provide a `forceRefresh` parameter to bypass cache when needed (e.g., refresh buttons).

#### 3. BaseFood Hierarchy
Foods and Recipes share common behavior via `BaseFood` abstract class:
- **Food** - Simple food items (`type: "simple"`)
- **Recipe** - Compound foods made from parts (`type: "compound"`)

Both can calculate nutrients, serving sizes, and macronutrient breakdowns.

#### 4. Part Model (Polymorphic Relationship)
The `Part` model enables flexible composition:
- **Parent**: Can be a Meal or Recipe (`parent_type`)
- **Child**: Can be a Food or Recipe (`join_type`)

This allows:
- Meals to contain Foods and Recipes
- Recipes to contain Foods and other Recipes (nested composition)

Database table `Parts` uses discriminator columns:
- `parent_id` + `parent_type` = what contains this part
- `join_id` + `join_type` = what this part references
- `amount` + `amount_type` = quantity information

### Database Schema

See `api/design.md` for full schema. Key relationships:

- **Foods** table - Base nutrient data (simple foods)
- **Recipes** table - Compound foods (id + name only)
- **Parts** table - Junction table for Meal→Food/Recipe and Recipe→Food/Recipe
- **Meals** table - Daily meal entries
- **Exercises** table - Exercise tracking
- **Weight** table - Weight measurements

### Important Technical Details

#### Frontend-Backend Type Mapping
When working with the Part model, note these field mappings:

**Frontend (TypeScript)**:
```typescript
class Part {
  amount: number;  // quantity
  unit: string;    // measurement unit
}
```

**Backend (PHP)**:
```php
class Part {
  $size;  // maps to 'amount' column in DB
  $unit;  // maps to 'amount_type' column in DB
}
```

The `ToArray()` method handles this mapping:
```php
public function ToArray(bool $includeRelated = true): array {
  return array(
    "amount" => $this->size,       // Maps to DB column name
    "amount_type" => $this->unit,  // Maps to DB column name
  );
}
```

#### API Response Security
Backend models must use `ToArray()` before sending to frontend:
- Database objects should **never** be serialized directly
- The `database` property in `SQL_Model` is `protected` to prevent exposure
- Always call `ToArray()` on models before adding to response array

Example from `controller.php`:
```php
case "meals":
  foreach ($return[0]->data as $i => $m) {
    $meal = new Meal($m["id"], $modeler->getDatabase());
    $meal->GetRelated();
    $return[0]->data[$i] = $meal->ToArray(); // Convert to array
  }
```

#### Type Field Requirement
Both Food and Recipe must include a `type` field in their `ToArray()` output:
- Food: `"type" => "simple"`
- Recipe: `"type" => "compound"`

This enables the frontend `Part.fromPayload()` to correctly instantiate the appropriate class.

### UI Component Library

This project uses **PrimeVue 4** with **Tailwind CSS** for styling:
- **PrimeVue Components**:
  - Button states: `severity="primary|success|danger|warning"`
  - Button styles: `outlined`, `text`, or default (filled)
  - Icons: Use PrimeIcons (e.g., `icon="pi pi-plus"`)
  - Forms: Use PrimeVue form components (InputText, InputNumber, Dropdown, Calendar, Textarea)
- **Tailwind CSS**:
  - Use Tailwind utility classes for layouts, spacing, and responsive design
  - PrimeVue and Tailwind are configured to work together via CSS layers
  - Layer order: `tailwind-base, primevue, tailwind-utilities`
  - Custom theme colors are defined in `src/main.ts` using PrimeVue's preset system

### Routing Convention

Routes follow a consistent pattern:
```
/{module}/list       - List view (e.g., /food/list)
/{module}/:id        - Detail view (e.g., /food/123 or /food/create)
```

Use route name references in navigation: `router.push({ name: 'food-list' })`

### Dialog System

Global dialog system via `useDialog()` store:
```typescript
const $dialog = useDialog();

// Open dialog with data
$dialog.setData({
  id: item.id,
  onClose: async (data) => { /* handle save */ },
  onDelete: async () => { /* handle delete */ }
});
$dialog.open("dialogname");
```

Dialogs are registered in the main App component and use the dialog store for data passing.

## Common Development Patterns

### Adding a New Module

1. Create module folder: `src/modules/{module}/`
2. Create domain model extending appropriate base class
3. Create service extending `BaseService`
4. Create Pinia store with in-memory caching
5. Create List and Details chunks
6. Create Card component for list display
7. Add routes to `src/router/index.ts`
8. Add navigation button to `src/modules/core/components/SiteHeader.vue`

### Backend Model Requirements

When creating/updating backend models:
1. Extend `SQL_Model` base class
2. Implement `ConvertFromClientRequest()` for incoming data
3. Implement `ToArray()` for outgoing data - **always** exclude the `database` property
4. Use `$includeRelated` parameter in `ToArray()` to conditionally include nested objects
5. For database operations, pass `false` to `ToArray($includeRelated = false)` to exclude related objects
6. Implement `GetRelated()` to load associated data (Parts, etc.)
7. Add type field: `"type" => "simple"` or `"type" => "compound"`

### Working with Parts

When dealing with meal/recipe composition:
1. Parts connect parents (Meal/Recipe) to children (Food/Recipe)
2. Always load related data via `GetRelated()` on backend before sending response
3. Frontend `Part.fromPayload()` requires the food object to have a `type` field
4. Backend `Part.ToArray()` uses `$includeRelated` flag to control whether food data is included
5. When saving, use `ToArray(false)` to exclude the food object (only save foreign key)

### Filter and Sort System

The `FilterOptions` model provides consistent filtering across list views:
- Date range filtering via `FilterOptionsRange`
- Sorting via `Sort` with field-specific sort options
- Paging via `FilterOptionsPaging`

Use `FilterBar` component to render filter UI.
