---
sidebar_position: 5
---

# Continuous Integration

Since `@pallad/config` allows you to run check configuration without running your entire app you can add a step of
configuration check to your CI setup.

Just run
```bash
pallad-config -d fails-only
```
`-f fails-only` flag disables output of configuration and if everything is fine then command exit with code 0,
otherwise exits with code 1 and therefore causing CI to fail.

## Security aspect of checking configuration in CI

You might ask: `wait wait wait, running configuration check on CI so it has to have an access to my production? This is not safe!`.
I'll answer the same as other great people in IT: `It depends`.

1) You can limit permissions for your CI to access only small subset of resources necessary for configuration check in CI, therefore limiting security risk.
2) Are you running migration from CI? Then your CI already has the access to application environment so that's not a problem.
3) If none of above points is feasible for you then you can skip this step and there is nothing wrong with that! That's just your choice :)

## What about providing secrets for tasks in kubernetes or other container management solutions?
I guess we're talking about approach of having task definition with env variables injected, mapped values from secret storages etc.

I just simply don't like this approach since it is more error-prone.
We can argue whether it is more secure or smth but I do believe having configuration defined 
in one place and having one tool that checks all of this is much better approach. 
Not only it's lowering the risk of failure but in the end the setup is just simpler.
With such wide variety of security tools available in the cloud to prevent unauthorized access to resources the approach I'm describing here seems just "right".
