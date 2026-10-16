const fontDetails = {
  name: "Nunito Sans",
  family: "'Nunito Sans', sans-serif",
  className: "font-nunito",
  variable: "var(--font-nunito)",
} as const

const usage = {
  headings: `font-[family-name:${fontDetails.variable}]`,
  body: `font-[family-name:${fontDetails.variable}]`,
  buttons: `font-[family-name:${fontDetails.variable}]`,
  navigation: `font-[family-name:${fontDetails.variable}]`,
  labels: `font-[family-name:${fontDetails.variable}]`,
} as const

/**
 * Font utility functions for consistent typography across the project
 */
export const fonts = {
  main: fontDetails.className,
  mainVar: fontDetails.variable,
  headings: usage.headings,
  body: usage.body,
  buttons: usage.buttons,
  navigation: usage.navigation,
  labels: usage.labels,
  get: (type: keyof typeof usage) => usage[type],
  with: (fontClass: string, ...otherClasses: string[]) =>
    [fontClass, ...otherClasses].filter(Boolean).join(" "),
}

/**
 * Template literal helper for font classes
 */
export const font = (type: 'headings' | 'body' | 'buttons' | 'navigation' | 'labels') => fonts.get(type)

/**
 * Example usage:
 * 
 * // Direct usage
 * <h1 className={fonts.headings}>Title</h1>
 * <p className={fonts.body}>Text</p>
 * <button className={fonts.buttons}>Click</button>
 * 
 * // With additional classes
 * <p className={fonts.with(fonts.body, 'text-lg', 'mb-4')}>Text</p>
 * 
 * // Template literal
 * <button className={`${font('buttons')} px-4 py-2`}>Button</button>
 */
