const path = require('path');

// set up process arguments
process.argv = [...process.argv.slice(0, 2), 'DEV=1', 'REPORTING_LEVEL=42', 'FOO=BAR'];

// set up env vars
process.env.CONTENT_DIR = './mock-content/dir/';
process.env.BUILD_DIR = './mock-build-dir/';
process.env.TEMPLATE_DIR = './mock-template-dir/';
process.env.EXTRACT_CHAR_LIMIT = 1234;
process.env.PORT = 4242;
process.env.RENDER_DRAFTS = true;

const {
  // NOTE: we're assuming that the calculations for the base_dir are correct, and using them in the test
  BASE_DIR,
  BUILD_DIR,
  IS_DEV,
  PORT,
  BUILD_STATIC_DIR,
  CONTENT_DIR,
  REPORTING_LEVEL,
  EXTRACT_CHAR_LIMIT,
  RENDER_DRAFTS,
  TEMPLATE_DIR,
  processArgMap,
} = require('./constants');

describe('constants', () => {
  it('uses process environment vars and args to override constants', () => {
    expect(IS_DEV).toBe(true);
    expect(PORT).toBe('4242');

    expect(BUILD_DIR).toBe(path.join(BASE_DIR, '/mock-build-dir/'));
    expect(BUILD_STATIC_DIR).toBe(path.join(BASE_DIR, '/mock-build-dir/static/'));
    expect(CONTENT_DIR).toBe(path.join(BASE_DIR, '/mock-content/dir/'));
    expect(TEMPLATE_DIR).toBe(path.join(BASE_DIR, '/mock-template-dir/'));

    expect(REPORTING_LEVEL).toBe(42);
    expect(EXTRACT_CHAR_LIMIT).toBe(1234);
    expect(RENDER_DRAFTS).toBe(true);
    expect(processArgMap).toEqual({ DEV: '1', REPORTING_LEVEL: '42', FOO: 'BAR' });
  });
});
