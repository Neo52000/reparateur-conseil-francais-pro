

# Fix: Add Blog Booster Social to horizontal nav

The link was added to the left sidebar (`AdminSidebar.tsx`) but the admin uses `HorizontalAdminNav.tsx` with the "Outils" dropdown menu. The "Blog Booster Social" entry needs to be added to the `toolsItems` array in `HorizontalAdminNav.tsx`, right after the "Blog & Contenu" entry.

## Change

**File: `src/components/admin/modern/HorizontalAdminNav.tsx`**

Add a new entry after the `blog` item (line 121) in `toolsItems`:

```ts
{
  id: 'social-booster',
  label: 'Blog Booster Social',
  icon: <Megaphone className="w-4 h-4" />,
  isNew: true,
},
```

Also ensure `Megaphone` is imported from `lucide-react`.

