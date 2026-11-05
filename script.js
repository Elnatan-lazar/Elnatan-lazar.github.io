// Trace the Eulerian circuit once on load, and again whenever the graph is clicked.
(function () {
  const path = document.getElementById('circuit');
  const btn = document.getElementById('replay');
  if (!path || !btn) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function trace() {
    if (reduce) return;
    path.classList.remove('tracing');
    void path.getBoundingClientRect(); // restart the animation
    path.classList.add('tracing');
  }

  btn.addEventListener('click', trace);
  trace();
})();
