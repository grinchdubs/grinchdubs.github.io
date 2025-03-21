---
layout: post
---

# Most Used Linux Apps

Here are some more modern tools for linux cli. Most of them replace command you already know. Use aliases to use the old command so it doesn't get annoying. I use these on Debian and Arch based distros but these should also work with others.

#### Portal, CLI file transfer
Commands needed for setup:

`curl -sL portal.spatiumportae.com | sudo bash`

#### SSHS, ssh manager
Commands needed for setup:

`cargo install --git https://github.com/quantumsheep/sshs`

#### Yazi, CLI file explorer
Commands needed for setup:

`cargo install --locked yazi-fm yazi-cli`

#### Zoxide for a better cd
For faster and fuzzy cd usage:

`curl -sSfL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | sh`

#### Atuin for better command history
Super helpful command history with timestamps and search:

`curl --proto '=https' --tlsv1.2 -LsSf https://setup.atuin.sh | sh`

#### Eza for a better ls
This ls tool gives outputs that are a bit more useful
To install/setup follow this link to the install instructions. It can be installed in a variety of ways.

#### Tl:dr better man pages
This tool is if you want to get the main info from a man page without reading the whole thing:

`pip3 install tldr`

#### Fzf/zi for better find/search
Super powerful fuzzy search tool:

`sudo pacman -S fzf #For Arch based systems
sudo apt install fzf #for debian based systems`

#### Fzf.fish fzf for fish
Name says it all
Install docs are here.
Search Directory - Ctrl+Alt+f (F for file)
Search Git Status - Ctrl+Alt+s (S for status)
Search Git Log - Ctrl+Alt+l (L for Log)
Search History -  Ctrl+r (R for reverse-i-search)
Search Processes - Ctrl+Alt+p (P for process)
Search Variables - Ctrl+Alt+v (V for Variable)

#### Bat for a better cat command
More useful output than the normal cat command:

`sudo apt install bat #For debian based systems
or
pacman -S bat #For Arch based systems`

#### Bat preview
This works along side fzf.fish to give you a preview of files while you search for the correct one
Follow the fzf.fish install above

#### Screen for more terminal sessions
Allows for multiple sessions in 1 terminal window:

`sudo apt install screen
or
sudo pacman -S screen`

#### Localsend for local file sharing
Very similar to airdrop but available on all OSes:

`flatpak install flathub org.localsend.localsend_app #For flatpak package manager
or
sudo snap install localsend #For snap package manager
or
yay -S localsend-bin #For Arch based systems`

#### Fish, my favorite shell
Commands needed for setup:

`echo /usr/local/bin/fish | sudo tee -a /etc/shells
chsh -s /usr/local/bin/fish`

#### Firacode Nerd font Mono for nice terminal icons
This font has a bunch of symbols that are nice to have.

#### Chezmoi .dotfile backup to github
A cli app for keep track of your .dotfiles changes and uploading to github
The install for this can be very involved and requires a bit of git knowledge. Install docs are here.
Here is my script for installing most of this stuff on a Debian based distro…I used this on Kali Linux