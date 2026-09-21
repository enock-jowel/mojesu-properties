/**
 * Lighthouse CI — mobile lab against shared templates.
 * Soft floors catch large regressions without flaking on cold TTFB.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm start',
      startServerReadyPattern: 'Ready',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/rent/',
        'http://localhost:3000/areas/',
      ],
      numberOfRuns: 1,
      settings: {
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 360,
          height: 640,
          deviceScaleFactor: 2,
          disabled: false,
        },
        throttlingMethod: 'devtools',
        onlyCategories: ['performance'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.5 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.15 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 8000 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
