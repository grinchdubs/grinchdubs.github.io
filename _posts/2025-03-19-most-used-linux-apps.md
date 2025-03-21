---
layout: post
---

# Most Used Linux Apps

Here are some more modern tools for linux cli. Most of them replace command you already know. Use aliases to use the old command so it doesn't get annoying. I use these on Debian and Arch based distros but these should also work with others.

#### Portal, CLI file transfer
Commands needed for setup:

`curl -sL portal.spatiumportae.com | sudo bash`

Install on linux with the command above. [Documentation](https://github.com/SpatiumPortae/portal)

#### SSHS, ssh manager
Commands needed for setup:

`cargo install --git https://github.com/quantumsheep/sshs`

Install on linux with the command above.  You will need to setup a .ssh/config file for this to work. [Documentation](https://github.com/quantumsheep/sshs?tab=readme-ov-file)

#### Yazi, CLI file explorer
Commands needed for setup:

`cargo install --locked yazi-fm yazi-cli`

Install on linux with the command above. [Documentation ](https://yazi-rs.github.io/docs/installation)

#### Zoxide for a better cd
For faster and fuzzy cd usage:
![](https://img.notionusercontent.com/s3/prod-files-secure%2F63319eb7-a808-4f94-8661-5626ea6a3328%2Ff494a4c0-0e4b-4462-8309-60af76c77fd0%2F20240624_00h39m20s_grim.png/size/w=1360?exp=1742616105&sig=GnzZiFei3AQbFvQYFaD6d3W_NraeaOzanQSgW_kzNxg)

`curl -sSfL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | sh`

Install on linux with the command above. You then need to add it to your shell config which you can find on the [github](https://github.com/ajeetdsouza/zoxide) page.

#### Atuin for better command history
Super helpful command history with timestamps and search:
![](https://img.notionusercontent.com/s3/prod-files-secure%2F63319eb7-a808-4f94-8661-5626ea6a3328%2F3022c4c1-e4ca-4258-84d0-49f67c9bbde5%2F20240624_00h38m12s_grim.png/size/w=1350?exp=1742616201&sig=nboNQybJnF2I2BABE9pleuUpSUtNnoelYVHCSwzAlNQ)

`curl --proto '=https' --tlsv1.2 -LsSf https://setup.atuin.sh | sh`

Install with the command above and add to your shell similar to how we did with zoxide. Details [here](https://docs.atuin.sh/guide/installation/)

#### Eza for a better ls
This ls tool gives outputs that are a bit more useful:
![](https://img.notionusercontent.com/s3/prod-files-secure%2F63319eb7-a808-4f94-8661-5626ea6a3328%2Ff55f3270-e63c-4599-b66e-8f8ae9f01a31%2F20240701_18h36m41s_grim.png/size/w=1350?exp=1742616205&sig=EzUy1MgWksheu1mMRM4wYG_sZq9bFl5Wwrs28n33RIc)

To install/setup follow this [link](https://github.com/eza-community/eza/blob/main/INSTALL.md) to the install instructions. It can be installed in a variety of ways.

#### Tl:dr better man pages
This tool is if you want to get the main info from a man page without reading the whole thing:
![](https://img.notionusercontent.com/s3/prod-files-secure%2F63319eb7-a808-4f94-8661-5626ea6a3328%2F6c470896-da97-49be-bc2d-8d6e47758183%2F20240624_00h39m37s_grim.png/size/w=1350?exp=1742616216&sig=o-2XRkIGr6E1YwRG28wVeBXdf9tUzmyAwJ29zQ14xDo)

`pip3 install tldr`

To install/setup follow this [link](https://github.com/eza-community/eza/blob/main/INSTALL.md) to the install instructions. It can be installed in a variety of ways.

#### Fzf/zi for better find/search
Super powerful fuzzy search tool:
![](https://img.notionusercontent.com/s3/prod-files-secure%2F63319eb7-a808-4f94-8661-5626ea6a3328%2Fd1321568-96ce-4a4c-8923-cdf16d470571%2F20240624_00h30m22s_grim(1).png/size/w=1350?exp=1742616236&sig=nOgC6sCZDSKrH_h4Y7HTiBSrMXxixi2VtK8pKEXdw98)

To install/setup follow this [link](https://github.com/junegunn/fzf?tab=readme-ov-file#installation) to the install instructions. It can be installed on a bunch of different OSes.

`sudo pacman -S fzf #For Arch based systems`

`sudo apt install fzf #for debian based systems`

#### Fzf.fish fzf for fish
Name says it all:
![](https://img.notionusercontent.com/s3/prod-files-secure%2F63319eb7-a808-4f94-8661-5626ea6a3328%2Fd1321568-96ce-4a4c-8923-cdf16d470571%2F20240624_00h30m22s_grim(1).png/size/w=1350?exp=1742616236&sig=nOgC6sCZDSKrH_h4Y7HTiBSrMXxixi2VtK8pKEXdw98)

Install docs are [here](https://github.com/PatrickF1/fzf.fish/tree/main).

	`Search Directory - Ctrl+Alt+f (F for file)

	Search Git Status - Ctrl+Alt+s (S for status)

	Search Git Log - Ctrl+Alt+l (L for Log)

	Search History -  Ctrl+r (R for reverse-i-search)

	Search Processes - Ctrl+Alt+p (P for process)

	Search Variables - Ctrl+Alt+v (V for Variable)

#### Bat for a better cat command
More useful output than the normal cat command:
![](https://img.notionusercontent.com/s3/prod-files-secure%2F63319eb7-a808-4f94-8661-5626ea6a3328%2F45e04a32-443c-420b-be90-fc0e89d07ca3%2F20240624_00h38m43s_grim(1).png/size/w=1350?exp=1742616242&sig=lxrV5PfTGQNicMNk6sY8TssfZi-NI3NdnbOGu3ZOCnc)

`sudo apt install bat #For debian based systems`

`or`

`pacman -S bat #For Arch based systems`

#### Bat preview
This works along side fzf.fish to give you a preview of files while you search for the correct one
![](https://img.notionusercontent.com/s3/prod-files-secure%2F63319eb7-a808-4f94-8661-5626ea6a3328%2F9e8060df-77bc-4f0f-b8af-9efe21af2d99%2F20240624_00h30m22s_grim(1).png/size/w=1350?exp=1742616242&sig=FWrZC6r167kk6chEyfeYgsMUf5NUa-fXWyrMpPlL1Ao)

Follow the fzf.fish install above

#### Screen for more terminal sessions
Allows for multiple sessions in 1 terminal window:
![](https://img.notionusercontent.com/s3/prod-files-secure%2F63319eb7-a808-4f94-8661-5626ea6a3328%2F2072b876-5018-4c8c-b8c8-7f159a2a0335%2F20240702_10h51m33s_grim.png/size/w=1350?exp=1742616241&sig=PaC-90OodSQhGfc-dsCmZK5NIn_VhV0UdEg6INPniKw)

`sudo apt install screen`

`or`

`sudo pacman -S screen`

[Here](https://gist.github.com/joaopizani/2718397) is my script for installing most of this stuff on a Debian based distro…I used this on Kali Linux

#### Localsend for local file sharing
Very similar to airdrop but available on all OSes:
![](https://img.notionusercontent.com/s3/prod-files-secure%2F63319eb7-a808-4f94-8661-5626ea6a3328%2F5b029718-dbc2-46ee-bdc7-be0bca7546e8%2F20240701_19h07m29s_grim.png/size/w=1350?exp=1742616241&sig=HN39tB56GKRffYKUhrwimrfSKlizmpDffi-6lGHy41I)

`flatpak install flathub org.localsend.localsend_app #For flatpak package manager
	or
	sudo snap install localsend #For snap package manager
	or
	yay -S localsend-bin #For Arch based systems`

#### Fish, my favorite shell
Commands needed for setup:

`echo /usr/local/bin/fish | sudo tee -a /etc/shells`

	chsh -s /usr/local/bin/fish

#### Firacode Nerd font Mono for nice terminal icons
![](https://img.notionusercontent.com/s3/prod-files-secure%2F63319eb7-a808-4f94-8661-5626ea6a3328%2F25b57304-90e9-4961-84c7-8eca31c5af47%2FScreenshot_2024-07-03_at_11.59.57_AM.png/size/w=970?exp=1742616240&sig=k57rdVGLGoo-s2itbi2uCbTnL5NBwj1Z3za7TNl8598)
This [font](https://github.com/ryanoasis/nerd-fonts/releases/download/v3.2.1/FiraMono.zip) has a bunch of symbols that are nice to have.

#### Chezmoi .dotfile backup to github
A cli app for keep track of your .dotfiles changes and uploading to github

The install for this can be very involved and requires a bit of git knowledge. Install docs are here.
[Here](https://github.com/grinchdubs/scripts/blob/main/base_installs.sh) is my script for installing most of this stuff on a Debian based distro…I used this on Kali Linux

