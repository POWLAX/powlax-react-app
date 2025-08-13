# Page snapshot

```yaml
- main:
  - heading "Teams" [level=1]
  - paragraph: Manage your lacrosse teams and rosters
  - img
  - heading "No Teams Found" [level=3]
  - paragraph: You're not currently a member of any teams.
  - button "Create Team":
    - img
    - text: Create Team
  - img
  - text: Quick Actions
  - link "Practice Planner Create practice plans":
    - /url: /teams/no-team/practiceplan
    - button "Practice Planner Create practice plans"
  - button "Add Players Manage rosters"
  - button "Team Stats View performance"
  - button "Communication Send messages"
- navigation:
  - link "Dashboard":
    - /url: /dashboard
    - img
    - text: Dashboard
  - link "Teams":
    - /url: /teams
    - img
    - text: Teams
  - link "Academy":
    - /url: /skills-academy/workouts
    - img
    - text: Academy
  - link "Resources":
    - /url: /resources
    - img
    - text: Resources
- region "Notifications alt+T"
- alert
```