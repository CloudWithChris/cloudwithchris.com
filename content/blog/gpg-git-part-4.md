---
Author: chrisreddington
Description: "Part 4 - The final part (at least for now, until I find somewhere else that we can expand on with this)! This part will focus on porting the keys that we have recently generated onto our YubiKey device. I own a YubiKey NEO, so i'll be using that."
PublishDate: "2021-03-17T12:00:00Z"
blog_image: img/cloudwithchrislogo.png
categories:
- Announcement
date: "2021-03-17T12:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Technology
- DevOps
- Git
- Security
title: Using GPG Keys to sign Git Commits - Part 4
---
Part 4 - The final part (at least for now, until I find somewhere else that we can expand on with this)! This part will focus on porting the keys that we have recently generated onto our YubiKey device. I own a YubiKey NEO, so i'll be using that.

**Note: Be aware that the YubiKey NEO has a limitation where it can only hold keys up to a size of 2048 bits. If you have generated a key longer than this, then the move will fail. You may need to go through the previous blog posts to re-generate the keys. Though I mentioned this limitation in part 2.**

The YubiKey itself is considered as a "smart card" device. When you plug your YubiKey in, you should see that it gets detected as YubiKey NEO with a combination of additional information, e.g. Yubikey NEO OTP+UTF+CCID. I believe when I originally set mine up, that I needed to download the [YubiKey manager](https://developers.yubico.com/yubikey-manager-qt/) and switch modes as it didn't show up correctly. Let me know how you get on!

```bash
C:\Users\chris>gpg --card-status
Reader ...........: Yubico Yubikey NEO OTP U2F CCID 0
Application ID ...: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Application type .: OpenPGP
Version ..........: 2.0
Manufacturer .....: Yubico
Serial number ....: XXXXXXXX
Name of cardholder: Chris Reddington
Language prefs ...: en
Salutation .......:
URL of public key : [not set]
Login data .......: reddobowen
Signature PIN ....: forced
Key attributes ...: rsa2048 rsa2048 rsa2048
Max. PIN lengths .: 127 127 127
PIN retry counter : 3 3 3
Signature counter : 149
Signature key ....: XXXX XXXX XXXX XXXX XXXX  XXXX XXXX XXXX XXXX XXXX
      created ....: 2021-02-10 17:21:57
Encryption key....: [none]
Authentication key: [none]
General key info..: sub  rsa2048/SUBKEYXXXXXXXXXX 2021-02-10 Chris Reddington <XXXXXX@contoso.com>
sec#  rsa2048/MAINKEYXXXXXXXXX  created: 2021-02-10  expires: never
ssb>  rsa2048/SUBKEYXXXXXXXXXX  created: 2021-02-10  expires: 2022-02-10
                                card-no: 0006 06531587
```

**Note: A good [pro-tip from Scott Hanselman](https://www.hanselman.com/blog/how-to-setup-signed-git-commits-with-a-yubikey-neo-and-gpg-and-keybase-on-windows) at this stage. If you have access to multiple smart card readers (including Windows Hello), then you may need to include a reader-port in the scdaemon.conf file at %appdata%\gnupg\scdaemon.conf. This is a step that I had to complete, so thanks Scott for the heads up on this one!**

To move the GPG Key to the YubiKey, we need to use the gpg commandline once again. If you have multiple keys on the machine, then you may need to use the toggle in gpg to select the key that you want to move across. If you've followed the steps from these blog posts in order (and moved the Certification key off of the machine), then you shouldn't need to use this step. If you do, take a look at Scott's blog above, as he shows this approach.

Before completing the next step, make sure that you have backed up your keys. Keytocard is a destructive action (as also discussed over on [this GitHub issue](https://github.com/drduh/YubiKey-Guide/issues/19)).

```bash
gpg --edit-key YourSubkeyHere
gpg (GnuPG) 2.2.27; Copyright (C) 2021 g10 Code GmbH
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Secret subkeys are available.

pub  rsa2048/XXXXXXXXXXXXXXXX
     created: 2021-02-10  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb  rsa2048/XXXXXXXXXXXXXXXX
     created: 2021-02-10  expires: 2022-02-10  usage: S
     card-no: XXXX XXXXXXXX
[ultimate] (1). Chris Reddington <XXXXXX@contoso.com>
[ultimate] (2)  Chris Reddington <XXXXXX+XXXXXXXXXXXXXXX@users.noreply.github.com>

gpg> keytocard
Really move the primary key? (y/N) y
Please select where to store the key:
   (1) Signature key
Your selection? 1

gpg> save
```

Following on from the point made just before the code block - If you need to copy the same key onto another YubiKey (or need it on the machine for some reason), then you can delete the secret keys from the machine completely, and re-import the secret keys just like in our previous task. Remember what we have discussed though around principal of least privilege and separation of concerns.

You'll want to go ahead and make sure that your YubiKey has the appropriate pins set up. As described in the [YubiKey docs](https://developers.yubico.com/PIV/Introduction/YubiKey_and_PIV.html#:~:text=Technical%20details%20about%20the%20YubiKey,default%20PUK%20code%20is%2012345678.) the default pin is 12345678 and the default admin pin is 12345678. As you can imagine, these aren't the hardest to guess - so make sure you take the time to change these, and remember them!

You can achieve by using the below -

```bash
gpg --card-edit
gpg/card> admin
Admin commands are allowed

gpg/card> passwd
gpg: OpenPGP card no. XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX detected

1 - change PIN
2 - unblock PIN
3 - change Admin PIN
4 - set the Reset Code
Q - quit

Your selection? 1
PIN changed.

1 - change PIN
2 - unblock PIN
3 - change Admin PIN
4 - set the Reset Code
Q - quit

Your selection? 3
PIN changed.
```

Now, go ahead and try to make a signed commit in your local Git repository. Before you do, remove the YubiKey frmo your machine. You should see a slightly different prompt. For myself, I see something similar to the below -

![Git Commit requires a Smartcard](/img/blog/gpg-git-part-4/card-prompt.jpg)

And once you've inserted the YubiKey, a prompt to unlock the smartcard (Though your prompts may look slightly different, depending upon what's configured on your system) -

![Git Commit requires Smartcard Unlock to access key](/img/blog/gpg-git-part-4/card-unlock.jpg)

Success! You've now used the GPG signing key that you generated previously, transferred it onto a YubiKey device and generated a signed commit as a result. At this stage, you may want to generate separate signing keys for different machines/different YubiKeys, but I will leave that to your discretion dear reader.

I hope that this series has been useful. Please let me know how you get on, and if there may be additional areas that are useful... Who knows, maybe a part 5?

So until the next blog post, bye for now!