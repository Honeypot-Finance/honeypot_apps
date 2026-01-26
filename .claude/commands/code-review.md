---
description: Review code for best practices, modularity, scalability, and test coverage
---
Perform a comprehensive code review of recent changes or specified files.

Check for:
1. **Best Practices** - Error handling, logging, security, no hardcoded values
2. **Modularity** - Single responsibility, DRY, separation of concerns
3. **Scalability** - Efficient queries, connection pooling, async handling
4. **Abstraction** - Interfaces, adapter pattern, externalized config
5. **Test Coverage** - Unit tests exist, edge cases covered

Output format:
- 🔴 Critical issues (must fix)
- 🟡 Warnings (should fix)
- 🔵 Suggestions (nice to have)
- List files missing tests
