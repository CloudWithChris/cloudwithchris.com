---
Author: chrisreddington
Description: "Hopefully by now you've had a chance to read [part 1](gpg-git-part-1) of this series, which explains why you may be interested in using GPG keys to sign your commits. Congratulations on getting to the second part! In part two, we're going to focus on how I worked through setting up GPG in my Windows environment, and generating a set of keys for use. There were some challenges/hurdles along the way, and we'll talk through those too!"
PublishDate: "2021-03-03T12:00:00Z"
blog_image: img/cloudwithchrislogo.png
categories:
- Announcement
date: "2021-03-03T12:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Technology
- DevOps
- Git
- Security
title: Using GPG Keys to sign Git Commits - Part 2
---
Hopefully by now you've had a chance to read [part 1](gpg-git-part-1) of this series, which explains why you may be interested in using GPG keys to sign your commits. Congratulations on getting to the second part! In part two, we're going to focus on how I worked through setting up GPG in my Windows environment, and generating a set of keys for use. There were some challenges/hurdles along the way, and we'll talk through those too! I may do another separate blog post at a later poit on setting this up within Windows Subsystem for Linux. However, there are plenty of articles that alraedy focus on MacOS / Native Linux, so it isn't really the focus of this post.

In this post, I am making an assumption that you are brand new to using GPG Keys and do not yet have a master key, or any other keys in place.

As a reminder, we'll be focusing on setting this up in a Windows environment. As a first step, I downloaded [GPG4win](https://www.gpg4win.org/about.html). This contains several useful components, including Kleopatra, which exposes a number of the commands that we'll be using in the blog post through an intuitive User Interface as an alternative route.

Once installed, open up a command prompt window. While not required, if you haven't used it before - I'd encourage you to try out the [Windows Terminal](https://aka.ms/terminal) which is available through the Windows Store. It's a great piece of software, which allows you to interact with several commandline environments (e.g. PowerShell, PowerShell Core, Command Prompt, Several distributions of Windows Subsystem, Azure Cloud Shell, and even [connect directly to VMs in the cloud](https://www.thomasmaurer.ch/2020/05/how-to-ssh-into-an-azure-vm-from-windows-terminal-menu/)). This isn't required though, as you can just use the native command line prompt application.

**Important: Not using command prompt was one of my main hurdles when setting up in my own environment. My local preference is to use PowerShell rather than Command Prompt. After spending a lot of time digging into this, I discovered (with thanks to [this helpful gist](https://gist.github.com/chrisroos/1205934#gistcomment-2862988)_ that PowerShell may impact the encoding of the output file, which causes later issues. I'll explain a little later - but keep this in mind if you do insist on using PowerShell.**

In your command line, type the below:

```bash
gpg --list-keys
```

You will likely see an output similar to the below, if you have not yet initialised your keyring. If you have an initialised keyring but no previous keys, then you will see no output. Otherwise, you'll see the list of keys.

```
gpg: keybox 'C:/Users/chris/AppData/Roaming/gnupg/pubring.kbx' created
gpg: C:/Users/chris/AppData/Roaming/gnupg/trustdb.gpg: trustdb created
```

**Note: Take note of the above folder output, where the gnupg folder is stored on your own system. While I was debugging the command prompt/powershell issue, I renamed the gnupg folder several times, so that I could reinitialise the keyring and try a set of alternative steps.**

Now, it's time for us to start creating keys. First off, we're going to create a **GPG Master Key**. The idea behind this key is that we can "Certify" (C) other subkeys and identities associated with our key. Given the power here, it's a good practice to keep this separate from your signing keys/encryption keys (think of this as a principal of least privilege / separation of concerns).

We'll complete the next step as Alice (alice@contoso.com), as she was the one who was spoofed in our prior blog post's example. We'll use the gpg command, with the --expert and --full-generate-key flags. The --full-generate-key flag allows us generated a full featured key pair. 

The --full-generate-key command allows us to define:
* The keysize (i.e. number of bits)
* The valid timeframe of the key (i.e. how long until it expires)

The --expert flag gives us access to several additional configuration options, including:
* Additional options for the type of key we want
* Ability to granularly select the capabilities of the key (**S**ign, **C**ertify, **E**ncrypt and **A**uthenticate

Then, we will of course need to associate some information with that key (Name, E-mail Address, etc.)

```bash
C:\Users\chris>gpg --full-generate-key --expert
gpg (GnuPG) 2.2.27; Copyright (C) 2021 g10 Code GmbH
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Please select what kind of key you want:
   (1) RSA and RSA (default)
   (2) DSA and Elgamal
   (3) DSA (sign only)
   (4) RSA (sign only)
   (7) DSA (set your own capabilities)
   (8) RSA (set your own capabilities)
   (9) ECC and ECC
  (10) ECC (sign only)
  (11) ECC (set your own capabilities)
  (13) Existing key
  (14) Existing key from card
Your selection? 8

Possible actions for a RSA key: Sign Certify Encrypt Authenticate
Current allowed actions: Sign Certify Encrypt

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? S

Possible actions for a RSA key: Sign Certify Encrypt Authenticate
Current allowed actions: Certify Encrypt

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? E

Possible actions for a RSA key: Sign Certify Encrypt Authenticate
Current allowed actions: Certify

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? Q
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072) 2048
Requested keysize is 2048 bits
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 0
Key does not expire at all
Is this correct? (y/N) y

GnuPG needs to construct a user ID to identify your key.

Real name: Alice
Email address: alice@contoso.com
Comment:
You selected this USER-ID:
    "Alice <alice@contoso.com>"

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? O
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.
gpg: key A0B82563C344D4AA marked as ultimately trusted
gpg: directory 'C:/Users/chris/AppData/Roaming/gnupg/openpgp-revocs.d' created
gpg: revocation certificate stored as 'C:/Users/chris/AppData/Roaming/gnupg/openpgp-revocs.d\6E7ECB409742866910B10197A0B82563C344D4AA.rev'
public and secret key created and signed.

pub   rsa2048 2021-02-28 [C]
      6E7ECB409742866910B10197A0B82563C344D4AA
uid                      Alice <alice@contoso.com>
```

**Note: During the process, you will also be asked to enter a passphrase associated with that key. Do not forget this, as you'll need this to certify subkeys/identities, and use that key in general.**

A couple of observations -
* We used option 8 (RSA (Set your own capabilities)) so that we can make our master key only capable of Certify (as we discussed a little earlier on in the post).
* Take note of the hex value that is outputted (your master key ID). We'll need that later.
[CHECK THIS] * We set the keysize to be 2048 bits. This is needed due to the type of YubiKey that I have access to (YubiKey NEO). This was another gotcha that caused me to lose a fair bit of time, so do be aware of any limitations on your YubiKey. Ideally, you'd want this to be higher if your key is capable.

Now, in a real world scenario - we may need to add an additional uid for our Git signing. For example, GitHub [provides a capability](https://docs.github.com/en/github/setting-up-and-managing-your-github-user-account/blocking-command-line-pushes-that-expose-your-personal-email-address) where you can block any command line pushes that expose your personal e-mail address. Instead, you have a no-reply e-mail alias from GitHub that you can use instead. For me (Chris, no longer Alice!) - this is a step that I took when setting up my own signing process.

```bash
C:\Users\chris>gpg --edit-key  --expert 6E7ECB409742866910B10197A0B82563C344D4AA
gpg (GnuPG) 2.2.27; Copyright (C) 2021 g10 Code GmbH
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

gpg: checking the trustdb
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: depth: 0  valid:   1  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 1u
Secret key is available.

sec  rsa2048/A0B82563C344D4AA
     created: 2021-02-28  expires: never       usage: C
     trust: ultimate      validity: ultimate
[ultimate] (1). Alice <alice@contoso.com>

gpg> adduid
Real name: Alice
Email address: digits+githubusername@users.noreply.github.com
Comment:
You selected this USER-ID:
    "Alice <digits+githubusername@users.noreply.github.com>"

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? O
gpg: AllowSetForegroundWindow(23500) failed: Access is denied.

sec  rsa2048/A0B82563C344D4AA
     created: 2021-02-28  expires: never       usage: C
     trust: ultimate      validity: ultimate
[ultimate] (1)  Alice <alice@contoso.com>
[ unknown] (2). Alice <digits+githubusername@users.noreply.github.com>

gpg> uid 1

sec  rsa2048/A0B82563C344D4AA
     created: 2021-02-28  expires: never       usage: C
     trust: ultimate      validity: ultimate
[ultimate] (1)* Alice <alice@contoso.com>
[ unknown] (2). Alice <digits+githubusername@users.noreply.github.com>

gpg> primary

sec  rsa2048/A0B82563C344D4AA
     created: 2021-02-28  expires: never       usage: C
     trust: ultimate      validity: ultimate
[ultimate] (1)* Alice <alice@contoso.com>
[ unknown] (2)  Alice <digits+githubusername@users.noreply.github.com>

gpg> save
```

**Notice the little asterix after you type uid1, next to the first user id? That's used for the next line, when you say 'primary' making primary that item**.

At this point, it's probably a good time to create a backup of your master key. There are two commands to be aware of here, gpg --export that exports your **public key** (which you can share with others) and gpg --export-secret-key (which you should not share with anyone, and should hold securely).

You'll also notice in the below snippet that we use the --armor flag. This enables us to create an ascii armored output. If we don't use that, then you'll get a "non-readable" format. Go ahead and try if you like :)

```bash
gpg --export --armor 6E7ECB409742866910B10197A0B82563C344D4AA > master-public.txt
gpg --export-secret-key --armor 6E7ECB409742866910B10197A0B82563C344D4AA > master-private.txt
```

**Note: when exporting your private key, you will be asked for your secret passphrase.**

It's also a good practice to create a revocation certificate. This allows you to invalidate the certificate before its scheduled expiry date (if it has one, remember that we set ours to never). Note the asc format of the certificate.

```bash
gpg --gen-revoke 6E7ECB409742866910B10197A0B82563C344D4AA > master-revocation-certificate.asc
```

Okay, let's pause. At this point, we have a master private key, a master public key and a revocation certificate for the keypair. At this point, we'll now want to go ahead and create a subkey. Remember, the reason we're creating a subkey is so that if it gets compromised, then we don't need to revoke our primary (master) key. Instead, we can invalidate the compromised subkey and generate a new one in its place. It's also a common practice to have different subkeys for different machines, so if one machine gets compromised, then another is not. There is an excellent explanation (better than I could put together) on what a subkey is over at [The EnigMail project Forum](https://www.enigmail.net/forum/viewtopic.php?f=3&t=375).

```bash
C:\Users\chris>
C:\Users\chris>gpg --expert --edit-key 6E7ECB409742866910B10197A0B82563C344D4AA
gpg (GnuPG) 2.2.27; Copyright (C) 2021 g10 Code GmbH
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Secret key is available.

sec  rsa2048/A0B82563C344D4AA
     created: 2021-02-28  expires: never       usage: C
     trust: ultimate      validity: ultimate
[ultimate] (1). Alice <alice@contoso.com>
[ultimate] (2)  Alice <digits+githubusername@users.noreply.github.com>

gpg> addkey
Please select what kind of key you want:
   (3) DSA (sign only)
   (4) RSA (sign only)
   (5) Elgamal (encrypt only)
   (6) RSA (encrypt only)
   (7) DSA (set your own capabilities)
   (8) RSA (set your own capabilities)
  (10) ECC (sign only)
  (11) ECC (set your own capabilities)
  (12) ECC (encrypt only)
  (13) Existing key
  (14) Existing key from card
Your selection? 8

Possible actions for a RSA key: Sign Encrypt Authenticate
Current allowed actions: Sign Encrypt

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? E

Possible actions for a RSA key: Sign Encrypt Authenticate
Current allowed actions: Sign

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? Q
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072) 2048
Requested keysize is 2048 bits
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 1y
Key expires at 28/02/2022 21:01:33 GMT Standard Time
Is this correct? (y/N) y
Really create? (y/N) y
gpg: AllowSetForegroundWindow(3160) failed: Access is denied.
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.

sec  rsa2048/A0B82563C344D4AA
     created: 2021-02-28  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb  rsa2048/0F8B8DE7FDFE3872
     created: 2021-02-28  expires: 2022-02-28  usage: S
[ultimate] (1). Alice <alice@contoso.com>
[ultimate] (2)  Alice <digits+githubusername@users.noreply.github.com>

gpg> save
```

A couple of observations once again -
* We used option 8 (RSA (Set your own capabilities)) so that we can make our subkey only capable of the Sign action (again, considering our principal of least privilege).
* Notice that we now see there are two keypairs underneath our key. One with the appreciate sec, and one with the abbreviation ssb.
* Notice how we are not asked to confirm the name or e-mail address of the associated user. As this is associated with our original primary key (i.e. this is a subkey), we do not need to go ahead and enter this information once again.

Now, let's export the subkey so that we have a backup available.

```bash
gpg --export-secret-subkeys --armor A0B82563C344D4AA > subkeys-secret.txt
```

**Note: Whenever you're exporting secret key information, you will need to confirm your passphrase for the master key.**

At this point, I renamed my gnupg folder to a temporary rename (e.g. gnupg-temp), so that I can reinitialise my keyring by using any gpg command. The reason for this is to remove the master keys from your system (remember they should be stored in an offline backup securely), to minimise the chance of a potential compromise. Once complete, go ahead and import the subkeys secret information by using the below. 

```bash
C:\Users\chris>gpg --import subkeys-secret.txt
gpg: C:/Users/chris/AppData/Roaming/gnupg/trustdb.gpg: trustdb created
gpg: key A0B82563C344D4AA: public key "Alice <alice@contoso.com>" imported
gpg: To migrate 'secring.gpg', with each smartcard, run: gpg --card-status
gpg: key A0B82563C344D4AA: secret key imported
gpg: Total number processed: 1
gpg:               imported: 1
gpg:       secret keys read: 1
gpg:   secret keys imported: 1
```

And now, let's check the contents of the keyring -

```bash
C:\Users\chris>gpg --list-secret-keys
C:/Users/chris/AppData/Roaming/gnupg/pubring.kbx
------------------------------------------------
sec#  rsa2048 2021-02-28 [C]
      6E7ECB409742866910B10197A0B82563C344D4AA
uid           [ unknown] Alice <alice@contoso.com>
uid           [ unknown] Alice <digits+githubusername@users.noreply.github.com>
ssb   rsa2048 2021-02-28 [S] [expires: 2022-02-28]
```

Notice that the top item shows sec# instead of sec? Well, that's because the private key of the master (primary) key is not present in the keyring.

So you're probably wondering how/why you would use that revocation certificate?.. Add a little bit here.