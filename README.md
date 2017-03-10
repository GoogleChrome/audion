# Introduction

Audion is a Chrome extension that adds a Web Audio panel to dev tools. This panel lets the user inspect the web audio graph in real-time.

# General Usage - Navigating the Graph

Info on how the graph works, what colors encode, etc.

# Inspecting nodes.

How the user could inspect and modify nodes.

# Having fun.

Some examples of cool audio graphs you can make and tinker with.

# Caveats

Performance trade offs ... when you benchmark your app for performance, disable this extension.

# Documentation For Developers.

## Set up.
1. Set up [2-factor authentication for Github](https://github.com/blog/1614-two-factor-authentication) (as Google requires).
2. Add this origin as a remote to your local git repo. Use the `git@` address. The `https` address does not work with 2-factor authentication.
3. Make sure your version of node is at least 6. Install npm if you lack it.
4. Run `npm install` in the repo directory to install node modules.

## Build and run.

1. Build the extension with the default `gulp` command.
2. Load the `build` directory as an [unpacked Chrome extension](https://developer.chrome.com/extensions/getstarted#unpacked).
