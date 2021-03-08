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
Hopefully by now you've had a chance to read [part 1](./blog/gpg-git-part-1) of this series, which explains why you may be interested in using GPG keys to sign your commits. Congratulations on getting to the second part! In part two, we're going to focus on how I worked through setting up GPG in my Windows environment, and generating a set of keys for use. There were some challenges/hurdles along the way, and we'll talk through those too! I may do another separate blog post at a later poit on setting this up within Windows Subsystem for Linux. However, there are plenty of articles that alraedy focus on MacOS / Native Linux, so it isn't really the focus of this post.

In this post, I am making an assumption that you are brand new to using GPG Keys and do not yet have a master key, or any other keys in place.

As a reminder, we'll be focusing on setting this up in a Windows environment. As a first step, I downloaded [GPG4win](https://www.gpg4win.org/about.html). This contains several useful components, including Kleopatra, which exposes a number of the commands that we'll be using in the blog post through an intuitive User Interface as an alternative if you prefer.

Once installed, open up a command prompt window. While not required, if you haven't used it before - I'd encourage you to try out the [Windows Terminal](https://aka.ms/terminal) which is available through the Windows Store. It's a great piece of software, which allows you to interact with several commandline environments (e.g. PowerShell, PowerShell Core, Command Prompt, Several distributions of Windows Subsystem, Azure Cloud Shell, and even [connect directly to VMs in the cloud](https://www.thomasmaurer.ch/2020/05/how-to-ssh-into-an-azure-vm-from-windows-terminal-menu/)). This isn't required though, as you can just use the native command line prompt application.

**Important: Not using command prompt was one of my main hurdles when setting up in my own environment. My local preference is to use PowerShell rather than Command Prompt. After spending a lot of time digging into this, I discovered (with thanks to [this helpful gist](https://gist.github.com/chrisroos/1205934#gistcomment-2862988)) that PowerShell may impact the encoding of the output file, which causes later issues. I'll explain a little later - but keep this in mind if you do insist on using PowerShell.**

In your command line, type the below:

```bash
gpg --list-keys
```

You will likely see an output similar to the below, if you have not yet initialised your keyring. If you have an initialised keyring but no previous keys, then you will see no output. Otherwise, you'll see the list of keys.

```bash
gpg: keybox 'C:/Users/chris/AppData/Roaming/gnupg/pubring.kbx' created
gpg: C:/Users/chris/AppData/Roaming/gnupg/trustdb.gpg: trustdb created
```

**Note: Take note of the above folder output, where the gnupg folder is stored on your own system. While I was debugging the Command Prompt/PowerShell challenges, I renamed the gnupg folder several times, so that I could reinitialise the keyring and try a set of alternative steps.**

Now, it's time for us to start creating keys. First off, we're going to create a **GPG Master Key**. The idea behind this key is that we can "Certify" (C) other subkeys and identities associated with our key. Given the power here, it's a good practice to keep this separate from your signing keys/encryption keys (think of this as a principal of least privilege / separation of concerns).

In this post, we'll complete the next step as Alice (alice@contoso.com), as she was the one who was spoofed in our [prior blog post's example](gpg-git-part-1). Please feel free to follow along and complete this for yourself. We'll use the gpg command, with the --expert and --full-generate-key flags. The --full-generate-key flag allows us generated a full featured key pair.

The --full-generate-key command allows us to define:
* The keysize (i.e. number of bits)
* The valid timeframe of the key (i.e. how long until it expires)

The --expert flag gives us access to several additional configuration options, including:
* Additional options for the type of key we want
* Ability to granularly select the capabilities of the key (**S**ign, **C**ertify, **E**ncrypt and **A**uthenticate

Then, we will of course need to associate some information about the user with that key (Name, E-mail Address, etc.)

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

**Note: During the process, you will also be asked to enter a passphrase associated with that key. Do not forget this, as you'll need this to certify subkeys/identities, and when exporting / importing any of your secret (private) keys.**

A couple of observations -
* We used option 8 (RSA (Set your own capabilities)) so that we can make our master key only capable of Certify. As a reminder, this is because we want to have the principal of least privileged. This master key should be logged away as it can certify other subkeys, so we want to limit its capability (i.e. not Sign, Encrypt or Authenticate).
* Take note of the hex value that is outputted. This is your master key ID - we'll need that for several steps later.
* We set the keysize to be 2048 bits. Ideally, you'd want this to be higher if your key is capable. I went down this path at the YubiKey I have is a YubiKey NEO. The YubiKey NEO is capable of only storing keys with a maximum bitsize of 2048 bits. Now having said that, this master key won't be landing on our YubiKey NEO, instead we will copy a subkey with signing capabilities. I had thought that it shouldn't be a problem for the master key to be 4096 bits, though I did have some challenges copying my subkey to the YubiKey NEO when I had 4096 bits set on the master. I encourage you to try this out, and see your own results - my suspicion is that I misconfigured / mistyped something along the way.
  * In general, the bit size was another gotcha that caused me to lose a fair bit of time, so do be aware of any limitations on your YubiKey for the keys that will be transferred.
* We set the valid timeframe of this key to 0, i.e. it should never expire. You'll want to consider the most appropriate length, based upon the type of key you're generating. As this is my master key and will be used to certify other subkeys, I don't want it to expire, as I'll be storing it away securely with locked down access. You may choose a different length based upon your scenario. Ultimately, make sure you have a process in place to revoke the key if there is a breach (though, you would then need to set your entire chain again from scratch).

Now, in a real world scenario - we may need to add an additional uid (User ID) for our Git signing. As an example, GitHub [provides a capability](https://docs.github.com/en/github/setting-up-and-managing-your-github-user-account/blocking-command-line-pushes-that-expose-your-personal-email-address) where you can block any Git command line pushes that expose your personal e-mail address. Instead, you can use a no-reply e-mail alias from GitHub, ensuring your personal details remain private. For me (Speaking as Chris, and not Alice at this point!) - this is a step that I took when setting up my own signing process.

Let's go ahead and add the new uid. Notice in the below that we have a hexadecimal string? That is the ID of the key that we generated in the previous step. You'll need to replace the key id in the first line below with the key ID that you generated in the previous step (and all relevant future steps).

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

**Notice the little asterix after you type uid 1 into the GPG command prompt, next to the first user id? That's used when you type in your next command. When you type 'primary' you are specifying that you want uid 1 to be the primary identifier for this key.**.

At this point, it's probably a good time to create a backup of your master key. There are two commands to be aware of here, gpg --export which exports your **public key** (the one that you can share with others) and gpg --export-secret-key which exports your **private key** (the one that you should not share with anyone, and should store securely).

You'll also notice in the below snippet that we use the --armor flag. This enables us to create an ascii armored output. If we don't use that, then you'll get a "non-readable" format. Feel free to try without, so that you can understand the difference between the two!

**Note: Remember I mentioned that I had some challenges when using PowerShell? Well, this is where I encountered them! Everything would export successfully, but when trying to import the keys, there was a problem. I found this incredibly frustrating, as I couldn't understand what I was doing wrong. It turns out (after a lot of digging, and thanks to [this Gist](https://gist.github.com/chrisroos/1205934#gistcomment-2862988)), that the output file will be encoded with BOM when using PowerShell, which causes the import challenges. If you're set on using PowerShell, then you could do that and change the encoding of the file to UTF8 (without BOM), but I found that using Command Prompt made sense as it directly outputted the file with a UTF8 encoding, avoiding the challenges.**

As a reminder, remember that you'll need to replace the key ID used in the below example with your own key ID.

```bash
gpg --export --armor 6E7ECB409742866910B10197A0B82563C344D4AA > master-public.txt
gpg --export-secret-key --armor 6E7ECB409742866910B10197A0B82563C344D4AA > master-private.txt
```

**Note: When exporting your private key, you will be asked for the secret passphrase that you set when you created the master key.**

It's also a good practice to create a revocation certificate. This allows you to invalidate the key before its scheduled expiry date (That is, if it has an expiry date! Remember that we set ours to never? This would be the approach we'd need to folow to cause that key to expire.). Note also the asc file format of the certificate, which is the armored ASCII file format.

```bash
gpg --gen-revoke 6E7ECB409742866910B10197A0B82563C344D4AA > master-revocation-certificate.asc
```

Okay, let's pause. At this point, we have a master private key, a master public key and a revocation certificate for the master keypair. We'll now want to go ahead and create a subkey. Remember, the reason we're creating a subkey is so that if it gets compromised (as it may be stored on some less trusted machines/environments), then we don't need to revoke our primary (master) key. This is a good thing, as our master key may have certified other subkeys - If we lost that, then our entire keychain would be at risk. Instead, we can invalidate the compromised subkey and generate a new one in its place. It's also a common practice to have different subkeys for different machines, so if one machine gets compromised, then another is not. There is an excellent explanation (better than I could ever put together!) on what a subkey is over at [The EnigMail project Forum](https://www.enigmail.net/forum/viewtopic.php?f=3&t=375).

**Note: Don't forget, as you follow the below example - You'll need to replace the key ID with your own key ID!**

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
* Notice that we now see there are two keypairs underneath our key? One with the format abbreviation sec, and one with the abbreviation ssb.
  * In case you're interested, these abbreviations are:
    * pub (Public Key)
    * uid (User ID)
    * sig (Signature)
    * sub (Subkey)
    * sec (Secret Key / Private Key)
    * ssb (Secret Subkey / Private Subkey)
  * The [Debian Wiki](https://wiki.debian.org/Subkeys) also has a good explanation around subkeys if you're interested.
* Notice how we are not asked to confirm the name or e-mail address of the associated user? This is associated with our original primary key (remember that we've generated a subkey), we do not need to go ahead and enter this information once again.

Now, let's export the subkey so that we have a backup available. I could have used the longform text output of the key ID, but wanted to also show that you can use the shortform that was generated in the previous example. Notice how these 16 hexadecimal values are the final 16 from the longform identifier.

```bash
gpg --export-secret-subkeys --armor A0B82563C344D4AA > subkeys-secret.txt
```

**Note: Whenever you're exporting secret key information, you will need to confirm your passphrase for the master key.**

At this point, I renamed my gnupg folder to a temporary name (e.g. gnupg-temp), so that I can reinitialise my keyring by using any gpg command. I wanted to simulate removing the master keys from my keyring (remember they should be stored in an offline backup securely, and not on any machines which are in a low trust environment), to minimise the chance of a potential compromise. Once complete, go ahead and import the Secret Subkey by importing the text file from the last gpg step.

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

Right! We've now generated a master key and a subkey - congratulations! Make sure you go ahead and store your master key somewhere safe (ideally on a completely separate system from where you'll be using your subkey). We'll stop here for this particular blog post. In part 3, we'll configure git to use our subkey to sign our Git Commits and show how GitHub accepts the public key component for validation of the signing.

Again, I hope that this has been useful. I'd love to know how you're finding this particular series! Get in touch with me over on [Twitter @reddobowen](https://twitter.com/reddobowen), and let me know any creative ways that you're planning to use GPG keys!

Until the next blog post, bye for now!
