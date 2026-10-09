# MANUAL_SSOT_TEST.md

## Test Procedure for SSOT Storage and Reset

1. **Start Empty**:
   - Clear all local storage (`localStorage.clear()`).
   - Reload the application.
   - Verify: `DEMO_MODE` is `false`, `START_MODE` is `empty`, all collections are `[]`.

2. **Load Demo**:
   - Click "Load Demo Data".
   - Verify: `DEMO_MODE` is `true`, data is populated.

3. **Clear Data**:
   - Click "Clear All Data" (or equivalent button).
   - Verify: `DEMO_MODE` is set to `false`, `START_MODE` is `empty`, all collections return to `[]`.

4. **Populate Manually**:
   - Create 3 preventive tasks manually.
   - Verify: Tasks are persisted to `IndexedDB` (if applicable) and local state.

5. **Persistence Check**:
   - Refresh the page (F5).
   - Verify: The 3 manual tasks remain persisted.
