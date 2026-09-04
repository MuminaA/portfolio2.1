/**
 * The sky, the sun and the horizon haze — all plain CSS driven by the custom
 * properties in useWorldPalette. Three gradients cost nothing and mean the page
 * already has its colour before the meadow's 230kB of renderer has downloaded.
 */
export default function Sky() {
  return (
    <div className="sky" aria-hidden="true">
      <div className="sky__gradient" />
      <div className="sky__sun" />
      <div className="sky__haze" />
    </div>
  )
}
