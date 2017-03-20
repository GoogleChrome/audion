Audion is a Chrome extension that adds a Web Audio panel to dev tools. This panel lets the user inspect the web audio graph in real-time.

Refer to the wiki for documentation on usage.

# Documentation For Developers

## Set up
1. Review CONTRIBUTING.md. Note that Google requires contributors to sign a [Contributors License Agreement](https://cla.developers.google.com/about/google-individual).
2. Make sure your version of the [Java SE Development Kit](http://www.oracle.com/technetwork/java/javase/downloads/index.html) is at least 7. Many Mac users may have to install it. This download is unfortunately big.
3. Set up [2-factor authentication for Github](https://github.com/blog/1614-two-factor-authentication) (as Google requires).
4. Add this origin as a remote to your local git repo. Use the `git@` address. The `https` address does not work with 2-factor authentication.
5. Make sure your version of node is at least 6. Install npm if you lack it.
6. Run `npm install` in the repo directory to install node modules.

## Build and run

1. Build the extension with the default `gulp` command.
2. Load the `build` directory as an [unpacked Chrome extension](https://developer.chrome.com/extensions/getstarted#unpacked).
