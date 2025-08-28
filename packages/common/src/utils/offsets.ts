import { Bounds, getBounds, getViewportBounds } from '@ir-engine/xrui'

export const calculateAndApplyYOffset = (element: HTMLElement | null, additionalOffset = 0) => {
  if (!element) {
    return
  }
  const popupBounds = getBounds(element)
  const viewportBounds = getViewportBounds(new Bounds())

  const overflowTop = viewportBounds.top - (popupBounds?.top ?? 0)
  const overflowBottom =
    (popupBounds?.top ?? 0) + (popupBounds?.height ?? 0) - (viewportBounds.top + viewportBounds.height)

  let offsetY = 0

  if (overflowTop > 0) {
    // popup is overflowing at the top, move it down
    offsetY = overflowTop
  } else if (overflowBottom > 0) {
    // popup is overflowing at the bottom, move it up
    offsetY = -overflowBottom
  }

  offsetY += additionalOffset

  element.style.transform = `translateY(${offsetY}px)`
}
