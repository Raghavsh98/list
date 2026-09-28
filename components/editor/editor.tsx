"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { newId } from "@/core/ids"
import { slugify } from "@/core/slug"
import { MODES, type Mode } from "@/core/types"
import { publishList } from "@/lib/actions"
import type { Draft, DraftItem } from "./draft"
import { clearDraft, saveDraft, useSavedDraft } from "./use-saved-draft"

type Field = "url" | "credit" | "aside" | "image"

const FIELD_LABEL: Record<Field, string> = {
  url: "Link",
  credit: "Credit",
  aside: "Aside",
  image: "Image",
}

const FIELD_HELP: Record<Field, string> = {
  url: "https://…",
  credit: "David Hume, 1757",
  aside: "One of my favourites.",
  image: "https://…/photo.jpg",
}

const MODE_HELP: Record<Mode, string> = {
  plain: "Bullets. Order is yours, but it doesn’t claim anything.",
  ranked: "Numbers. Order means something.",
  checkable: "Readers can tick items off; ticks stay in their browser.",
}

const inputClass =
  "w-full bg-transparent outline-none placeholder:text-(--faint) disabled:opacity-50"

export function Editor({
  draftKey,
  initial,
  editing = false,
}: {
  draftKey: string
  initial: Draft
  editing?: boolean
}) {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft>(initial)
  const [errors, setErrors] = useState<string[]>([])
  const [dismissedDraft, setDismissedDraft] = useState(false)
  const [pending, startTransition] = useTransition()
  const itemRefs = useRef<Map<string, HTMLInputElement>>(new Map())
  const focusNext = useRef<{ id: string; field?: Field } | null>(null)

  // A draft from a previous visit is offered, never forced: silently resurrecting old text
  // over the published version is the kind of surprise that loses people's work.
  const saved = useSavedDraft(draftKey)
  const hasSavedDraft =
    !dismissedDraft && saved !== null && JSON.stringify(saved) !== JSON.stringify(draft)

  useEffect(() => {
    const id = window.setTimeout(() => saveDraft(draftKey, draft), 400)
    return () => window.clearTimeout(id)
  }, [draftKey, draft])

  useEffect(() => {
    const target = focusNext.current
    if (!target) return
    focusNext.current = null
    const el = target.field
      ? document.querySelector<HTMLInputElement>(`[data-field="${target.field}"][data-item="${target.id}"]`)
      : itemRefs.current.get(target.id)
    el?.focus()
    el?.select?.()
  }, [draft])

  const patch = useCallback((changes: Partial<Draft>) => setDraft((d) => ({ ...d, ...changes })), [])

  const patchItem = useCallback((id: string, changes: Partial<DraftItem>) => {
    setDraft((d) => ({
      ...d,
      items: d.items.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    }))
  }, [])

  const addItem = useCallback((after?: string) => {
    const item: DraftItem = { id: newId(), text: "" }
    focusNext.current = { id: item.id }
    setDraft((d) => {
      const i = after ? d.items.findIndex((x) => x.id === after) : -1
      const items = [...d.items]
      items.splice(i < 0 ? items.length : i + 1, 0, item)
      return { ...d, items }
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setDraft((d) => {
      if (d.items.length === 1) return { ...d, items: [{ id: newId(), text: "" }] }
      const i = d.items.findIndex((x) => x.id === id)
      const prev = d.items[i - 1] ?? d.items[i + 1]
      if (prev) focusNext.current = { id: prev.id }
      return { ...d, items: d.items.filter((x) => x.id !== id) }
    })
  }, [])

  const moveItem = useCallback((id: string, by: number) => {
    setDraft((d) => {
      const i = d.items.findIndex((x) => x.id === id)
      const j = i + by
      if (i < 0 || j < 0 || j >= d.items.length) return d
      const items = [...d.items]
      ;[items[i], items[j]] = [items[j], items[i]]
      focusNext.current = { id }
      return { ...d, items }
    })
  }, [])

  const openField = useCallback(
    (id: string, field: Field) => {
      focusNext.current = { id, field }
      patchItem(id, { [field]: "" })
    },
    [patchItem],
  )

  const title = draft.title.trim()
  const slug = draft.slugTouched ? draft.slug : slugify(title)
  const filled = draft.items.filter((i) => i.text.trim()).length

  function publish() {
    setErrors([])
    startTransition(async () => {
      const result = await publishList({
        id: draft.id,
        slug,
        title: draft.title,
        subtitle: draft.subtitle,
        mode: draft.mode,
        visibility: draft.visibility,
        items: draft.items,
        createdAt: draft.createdAt,
      })
      if (!result.ok) {
        setErrors(result.errors)
        return
      }
      clearDraft(draftKey)
      router.push(result.url)
      router.refresh()
    })
  }

  function onItemKeyDown(e: React.KeyboardEvent<HTMLInputElement>, item: DraftItem, index: number) {
    const mod = e.metaKey || e.ctrlKey
    if (e.key === "Enter" && mod) {
      e.preventDefault()
      publish()
      return
    }
    if (e.key === "Enter" && e.altKey) {
      e.preventDefault()
      if (item.aside === undefined) openField(item.id, "aside")
      else focusField(item.id, "aside")
      return
    }
    if (e.key === "Enter") {
      e.preventDefault()
      addItem(item.id)
      return
    }
    if (e.key === "Backspace" && item.text === "" && draft.items.length > 1) {
      e.preventDefault()
      removeItem(item.id)
      return
    }
    if ((e.key === "ArrowUp" || e.key === "ArrowDown") && (mod || e.altKey)) {
      e.preventDefault()
      moveItem(item.id, e.key === "ArrowUp" ? -1 : 1)
      return
    }
    if (e.key === "ArrowUp" && index > 0) {
      e.preventDefault()
      itemRefs.current.get(draft.items[index - 1].id)?.focus()
    }
    if (e.key === "ArrowDown" && index < draft.items.length - 1) {
      e.preventDefault()
      itemRefs.current.get(draft.items[index + 1].id)?.focus()
    }
  }

  function focusField(id: string, field: Field) {
    document.querySelector<HTMLInputElement>(`[data-field="${field}"][data-item="${id}"]`)?.focus()
  }

  // A pasted URL fills the link field instead of the text, which is what everyone means by it.
  function onItemPaste(e: React.ClipboardEvent<HTMLInputElement>, item: DraftItem) {
    const text = e.clipboardData.getData("text/plain").trim()
    if (!/^https?:\/\/\S+$/i.test(text) || item.url) return
    e.preventDefault()
    const changes: Partial<DraftItem> = { url: text }
    if (!item.text.trim()) {
      try {
        changes.text = new URL(text).hostname.replace(/^www\./, "")
      } catch {
        /* keep the text empty */
      }
    }
    patchItem(item.id, changes)
    focusNext.current = { id: item.id, field: item.text.trim() ? "url" : undefined }
  }

  return (
    <div className="pb-32">
      {hasSavedDraft && saved && (
        <p className="mb-6 text-[0.8125rem] text-(--muted)">
          There’s an unsaved draft of this list in this browser.{" "}
          <button
            type="button"
            className="underline underline-offset-4 hover:text-(--fg)"
            onClick={() => {
              setDraft(saved)
              setDismissedDraft(true)
            }}
          >
            Restore it
          </button>
          <span aria-hidden="true"> · </span>
          <button
            type="button"
            className="underline underline-offset-4 hover:text-(--fg)"
            onClick={() => {
              clearDraft(draftKey)
              setDismissedDraft(true)
            }}
          >
            Discard it
          </button>
        </p>
      )}

      <input
        aria-label="Title"
        className={`${inputClass} text-2xl font-medium tracking-tight`}
        placeholder="Untitled list"
        value={draft.title}
        maxLength={200}
        onChange={(e) => patch({ title: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            document.querySelector<HTMLInputElement>("[data-field='subtitle']")?.focus()
          }
        }}
      />
      <input
        aria-label="Subtitle"
        data-field="subtitle"
        className={`${inputClass} mt-1 text-[1.0625rem] text-(--muted)`}
        placeholder="A line about it (optional)"
        value={draft.subtitle}
        maxLength={500}
        onChange={(e) => patch({ subtitle: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            itemRefs.current.get(draft.items[0].id)?.focus()
          }
        }}
      />

      <ol className="mt-10 m-0 list-none p-0">
        {draft.items.map((item, index) => (
          <li key={item.id} className="group relative py-1.5">
            <div className="flex items-baseline gap-3">
              <span aria-hidden="true" className="w-5 shrink-0 text-right text-[0.8125rem] text-(--faint) tabular-nums">
                {draft.mode === "ranked" ? index + 1 : "·"}
              </span>
              <input
                aria-label={`Item ${index + 1}`}
                ref={(el) => {
                  if (el) itemRefs.current.set(item.id, el)
                  else itemRefs.current.delete(item.id)
                }}
                className={inputClass}
                placeholder={index === 0 ? "The thing" : ""}
                value={item.text}
                maxLength={500}
                onChange={(e) => patchItem(item.id, { text: e.target.value })}
                onKeyDown={(e) => onItemKeyDown(e, item, index)}
                onPaste={(e) => onItemPaste(e, item)}
              />
            </div>

            {(["url", "credit", "aside", "image"] as Field[]).map((field) =>
              item[field] === undefined ? null : (
                <div key={field} className="mt-1 flex items-baseline gap-3 pl-8">
                  <label
                    htmlFor={`${field}-${item.id}`}
                    className="w-12 shrink-0 text-[0.75rem] text-(--faint)"
                  >
                    {FIELD_LABEL[field]}
                  </label>
                  <input
                    id={`${field}-${item.id}`}
                    data-field={field}
                    data-item={item.id}
                    type={field === "url" || field === "image" ? "url" : "text"}
                    inputMode={field === "url" || field === "image" ? "url" : undefined}
                    className={`${inputClass} text-[0.875rem] ${field === "aside" ? "italic" : "text-(--muted)"}`}
                    placeholder={FIELD_HELP[field]}
                    value={item[field] ?? ""}
                    onChange={(e) => patchItem(item.id, { [field]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        itemRefs.current.get(item.id)?.focus()
                      }
                      if (e.key === "Escape" && !e.currentTarget.value) {
                        patchItem(item.id, { [field]: undefined })
                        itemRefs.current.get(item.id)?.focus()
                      }
                    }}
                  />
                </div>
              ),
            )}

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 pl-8 text-[0.75rem] text-(--faint) opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
              {(["url", "credit", "aside", "image"] as Field[]).map((field) => (
                <button
                  key={field}
                  type="button"
                  className="hover:text-(--fg)"
                  onClick={() =>
                    item[field] === undefined ? openField(item.id, field) : focusField(item.id, field)
                  }
                >
                  {FIELD_LABEL[field]}
                </button>
              ))}
              <button type="button" className="hover:text-(--fg)" onClick={() => moveItem(item.id, -1)}>
                Up
              </button>
              <button type="button" className="hover:text-(--fg)" onClick={() => moveItem(item.id, 1)}>
                Down
              </button>
              <button type="button" className="hover:text-(--fg)" onClick={() => removeItem(item.id)}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        className="mt-3 ml-8 text-[0.875rem] text-(--muted) hover:text-(--fg)"
        onClick={() => addItem(draft.items[draft.items.length - 1]?.id)}
      >
        Add an item
      </button>

      <div className="mt-14 flex flex-wrap items-start gap-x-10 gap-y-6 text-[0.875rem]">
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-2 text-[0.75rem] text-(--faint)">Mode</legend>
          <div className="flex gap-4">
            {MODES.map((mode) => (
              <label key={mode} className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="mode"
                  value={mode}
                  checked={draft.mode === mode}
                  onChange={() => patch({ mode })}
                  className="accent-(--fg)"
                />
                <span className="capitalize">{mode}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 max-w-[22rem] text-[0.75rem] text-(--muted)">{MODE_HELP[draft.mode]}</p>
        </fieldset>

        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-2 text-[0.75rem] text-(--faint)">Visibility</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="visibility"
                checked={draft.visibility === "public"}
                onChange={() => patch({ visibility: "public" })}
                className="accent-(--fg)"
              />
              <span>Public</span>
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="visibility"
                checked={draft.visibility === "unlisted"}
                onChange={() => patch({ visibility: "unlisted" })}
                className="accent-(--fg)"
              />
              <span>Unlisted</span>
            </label>
          </div>
          <p className="mt-2 max-w-[22rem] text-[0.75rem] text-(--muted)">
            {draft.visibility === "public"
              ? "Anyone can read it, and it shows up in the feed and in search."
              : "Only people with the link can read it. It stays out of the feed and search."}
          </p>
        </fieldset>

        <div>
          <label htmlFor="slug" className="mb-2 block text-[0.75rem] text-(--faint)">
            Link
          </label>
          <div className="flex items-baseline">
            <span className="text-(--muted)">/{draft.handle}/</span>
            <input
              id="slug"
              className={`${inputClass} w-40`}
              value={slug}
              placeholder="your-list"
              maxLength={64}
              onChange={(e) => patch({ slug: e.target.value, slugTouched: true })}
            />
          </div>
        </div>
      </div>

      <div
        className="sticky bottom-0 mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 bg-(--bg) py-4 text-[0.875rem]"
        aria-live="polite"
      >
        <button
          type="button"
          onClick={publish}
          disabled={pending || !title || filled === 0}
          className="bg-(--fg) px-4 py-2 text-(--bg) disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Publishing…" : editing ? "Save" : "Publish"}
        </button>
        <span className="text-(--muted)">
          {filled} {filled === 1 ? "item" : "items"}
        </span>
        <span className="text-(--faint)">
          Enter for a new item · ⌥Enter for an aside · ⌘Enter to publish
        </span>
      </div>

      {errors.length > 0 && (
        <div role="alert" className="mt-2 text-[0.875rem]">
          <p className="text-(--muted)">This isn’t ready yet:</p>
          <ul className="mt-1 m-0 list-none p-0">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
