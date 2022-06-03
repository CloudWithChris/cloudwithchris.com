---
Authors: 
- chrisreddington
Description: "In this post, I'll be talking about how to use interfaces in Go. This is a continuation of my learning using the Go language. I'll use interfaces to create an  application that interacts with several types of bank accounts."
Date: "2022-05-16T08:00:00Z"
image: img/cloudwithchrislogo.png
PublishDate: "2022-05-16T08:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Go
- Golang
- Programming
- Interfaces
- Developers
- App Development
- Visual Studio Code
banner: "images/banner.png"
title: Interfaces in Go
---
In this post, I'll be talking about how to use interfaces in Go. This is a continuation of my learning using the Go language. I'll use interfaces to create an  application that interacts with several types of bank accounts.

## What is an interface?

Let's start with defining the concept of an interface. An interface is a set of methods that a type must implement.

In essence, this is a contract that a concrete type must implement. This can be useful when you want to loosely couple your software, so that you're not depending on a specific implementation (and can then future-proof yourself).

> **Thought:** You may have previously heard this called as a generic type. It can be used as a dependency (or reference), and can be replaced by any type that implements the interface. This type of pattern is commonly known as Dependency Injection (DI).

That sounds a bit confusing, so let's break it down into a tangible example.

Let's say we have a type called `Account`. This type has two methods, `Deposit` and `Withdraw`.

Our fictitious bank might have different types of accounts. For example, we might offer a current account, a savings account, and an Individual Savings Account (ISA) for our customers. Each of these accounts have the same basic characteristics (e.g. they have a balance, and they can deposit and withdraw money), but they will have different concrete behaviours (i.e. what happens when you deposit or withdraw money in each of those scenarios might be different).

So, why would we want to create a generic type (or interface)? It allows us to program against something 'universal' (i.e. a contract), instead of the concrete type. This aids in re-usability, and gives us flexibility to make adjustments in the future, such as completely new implementations. What if we decided to offer an account for Crypto currencies? We could create a new type of account, and then implement the interface for that type.

This means that we'll begin to write code that can be used with any type that implements the interface (e.g. a current account, a savings account, or a stock account), rather than just one type.

## Interfaces in Go

The concept of an interface in Go isn't particularly different from other languages. You define an interface with a set of methods -

```go
type IAccount interface {
  Deposit(amount float64) error
  GetAccountNumber() string
  GetBalance() float64
  OpenAccount() IAccount
  Transfer(receiverAccount string, amount float64) error
  Withdraw(amount float64) error
}
```

In the above example, we are saying that a type which implements the IAccount interface must implement several methods, including -

* `Deposit` - This method will allow us to deposit money into the account.
* `GetAccountNumber` - This method will return the account number of the account.
* `GetBalance` - This method will return the balance of the account.
* `OpenAccount` - This method will create a new account.
* `Transfer` - This method will allow us to transfer money from one account to another.
* `Withdraw` - This method will allow us to withdraw money from the account.

In that example, we are saying that any type which implements the interface must implement all of the methods (matching that specific method signature).

This provides us flexibility. A current account, a savings account, or a stock account may be implemented in different ways.

For example, a current account provides easy access to the balance. However, a savings account may not allow transfers. Whereas a stock account may only allow withdrawals if a fee is paid.

## Creating a concrete type against an interface

Creating a concrete type against an interface is as simple as creating a type that implements each method of the interface. If the concrete type implements some of the methods, then the compiler will complain. It complains because it has inferred (implicitly) that you're building against the interface.

This is slightly different from other languages, where you would create a type that explicitly implements the interface.

As an example, in C#, we would create a class that implements the interface. Notice that we use the : symbol to separate the interface from the class, and explicitly call out which interfaces the class implements.

```csharp
public MyClass : IInterfaceThatItImplements
{
  public void MethodThatImplementsInterface()
  {
    // Implementation goes here
  }
}
```

This is different to Go. In Go, we create a type that implements the interface. Notice that the interface is not explicitly called out.

```go
type CurrentAccount struct {
  accountNumber string
  balance       float64
}

func (account CurrentAccount) OpenAccount() IAccount {
  return &CurrentAccount{
    accountNumber: "C-" + RandomString(8),
    balance:       0.00,
  }
}

func (account *CurrentAccount) Deposit(amount float64) error {
  account.balance += amount
  return nil
}

func (account *CurrentAccount) GetAccountNumber() string {
  return account.accountNumber
}

func (account *CurrentAccount) GetBalance() float64 {
  return account.balance
}

func (account *CurrentAccount) Transfer(receiverAccount string, amount float64) error {
  account.balance -= amount
  // TODO: Transfer to receiver account
  return nil
}

func (account *CurrentAccount) Withdraw(amount float64) error {
  account.balance -= amount
  return nil
}
```

Notice that the method signatures match those which are defined in the interface? This is how Go recognises that the CurrentAccount type implements the IAccount interface.

> **Tip:** You may notice that the methods are referring to a pointer to the struct, e.g. ``func (account *CurrentAccount)...``. This is what's known as a **pointer receiver** in Go, i.e. it can modify the value to which the receiver points. I discuss pointers in a previous blog post, which you can find [here](/blog/go-pointers).

If we remove one of the methods from the interface definition, the Go compiler will complain. For example, when commenting out the transfer method, we receive the following error:

```bash
accounts/CurrentAccount.go:25:9: cannot use &CurrentAccount{…} (value of type *CurrentAccount) as type IAccount in return statement:

*CurrentAccount does not implement IAccount (missing Transfer method)
```

In essence, the compiler is saying that the CurrentAccount type does not implement the IAccount interface. Therefore, we cannot use CurrentAccount until it fully implements the interface (i.e. all of the methods).

We can then implement additional types against the IAccount interface. For example, we can create a savings account.

```go
type SavingsAccount struct {
  accountNumber string
  created       time.Time
  savings       float64
}

func (account SavingsAccount) OpenAccount() IAccount {
  return &SavingsAccount{
    accountNumber: "S-" + RandomString(8),
    savings:       0.00,
    created:       time.Now(),
  }
}

func (account *SavingsAccount) Deposit(amount float64) error {
  account.savings += amount
  return nil
}

func (account *SavingsAccount) GetAccountNumber() string {
  return account.accountNumber
}

func (account *SavingsAccount) GetBalance() float64 {
  return account.savings
}

func (account SavingsAccount) Transfer(receiverAccount string, amount float64) error {
  return errors.New("You cannot transfer from your savings account")
}

func (account *SavingsAccount) Withdraw(amount float64) error {

  if time.Now().Before(account.created.AddDate(0, 0, 90)) {
    return errors.New("You cannot withdraw from your savings account until 90 days after opening")
  }

  account.savings -= amount
  return nil
}
```

And finally, we could create an 'Individual Savings Account' (or ISA), as they are known in the UK.

```go
type ISAAccount struct {
  accountNumber      string
  balance            float64
  remainingAllowance float64
}

func (account ISAAccount) OpenAccount() IAccount {
  return &ISAAccount{
    accountNumber:      "I-" + RandomString(8),
    balance:            0.00,
    remainingAllowance: 400.00,
  }
}

func (account *ISAAccount) Deposit(amount float64) error {

  if (account.remainingAllowance - amount) > 0 {
    account.balance += amount
    account.remainingAllowance -= amount
    return nil
  }

  return errors.New("You cannot deposit more than your remaining allowance")
}

func (account *ISAAccount) GetAccountNumber() string {
  return account.accountNumber
}

func (account *ISAAccount) GetBalance() float64 {
  return account.balance
}

func (account *ISAAccount) Transfer(receiverAccount string, amount float64) error {
  return errors.New("You cannot transfer from your ISA account")
}

func (account *ISAAccount) Withdraw(amount float64) error {

  newBalance := account.balance - (amount + 5.00)

  if newBalance < 0 {
    return errors.New("You cannot withdraw more than your remaining allowance. Make sure to factor in the £5 fee")
  }

  // Take a fee of 5.00 of the currency
  account.balance = newBalance
  return nil
}
```

## Using an interface as a type

To put this all into context, I'm going to define a main function that uses the IAccount interface.

```go
var list []accounts.IAccount = []accounts.IAccount{
  &accounts.CurrentAccount{},
  &accounts.SavingsAccount{},
  &accounts.ISAAccount{},
}

func main() {
  for _, account := range list {
    account := account.OpenAccount()

    err := account.Deposit(500.00)
    if err != nil {
      fmt.Println(err)
    }

    err = account.Withdraw(50.00)
    if err != nil {
      fmt.Println(err)
    }

    err = account.Transfer("X-123456", 100.00)
    if err != nil {
      fmt.Println(err)
    }

    fmt.Println(account.GetAccountNumber() + ": " + strconv.FormatFloat(account.GetBalance(), 'f', 2, 64))
  }
}
```

This is a simple example of using an interface as a type. At the beginning of the program, we create an array of IAccounts. We then create an instance of a CurrentAccount, SavingsAccount and ISAAccount.

> **Tip:** The ``&`` is used in front of the variable name to specify the address of where that object lives. This allows us to use the methods on that object a little later on in the program (remember that we're using a pointer receiver).

Then, iterating over the array -

* On each of the accounts, we call the ``OpenAccount`` method. This returns a new instance of the account type.
* We then use that instance to call the ``Deposit``, ``Withdraw`` and ``Transfer`` methods.
* Finally, we print the account number and balance.

The output of this program would look like this:

```bash
C-17791850: 350.00
You cannot withdraw from your savings account until 90 days after opening
You cannot transfer from your savings account
S-60412984: 500.00
You cannot deposit more than your remaining allowance
You cannot withdraw more than your remaining allowance. Make sure to factor in the £5 fee
You cannot transfer from your ISA account
I-15765688: 0.00
```

For the current account, we can see that we end up with a balance of £350. This is correct, as the program was supposed to deposit £500, withdraw £50 and transfer £100. Due to the implementation of current account, this is as expected.

Now, let's look at the savings account. We can see that the program was supposed to deposit £500, withdraw £50 and transfer £100. However, the program ends up with a balance of £500. This is correct, once again due to the implementation of the savings account.

* The savings account cannot withdraw money within the first 90 days of opening.
* The savings account cannot transfer funds.

Finally, let's look at the ISA account. We can see that the program was supposed to deposit £500, withdraw £50 and transfer £100. However, the program ends up with a balance of £0. As you've guessed, this is correct as well.

* The ISA account gets created with a remaining allowance of £400. This is the amount that can be deposited into the account.
* The program attempts to transfer more than £400, which is not allowed, so the balance remains at £0.
* The program then attempts to withdraw £50. However, the balance is £0. You cannot withdraw from an empty balance, so an error is printed out.

## Conclusion

In this brief example, we've shown that we can program against an interface. This is useful when we want to use a type as a parameter in a function, but we don't have details about the implementation of the type.

Notice that I have not explicitly tied the type to the interface. This is because Go will infer the type from the implementation (i.e. based upon the method signatures).

While I've provided several snippets throughout, it doesn't paint the whole picture of the program. For example, the initialisation of the Go module. You can find the full example on my [GitHub Repository chrisreddington/go-examples](https://github.com/chrisreddington/go-examples).

Do you have any examples of how you have been using interfaces in Go? If so, please let me know in the comments below! I've been using them to implement a Hexagonal architecture, which allows for a lot of flexibility in the way that we can use our code. I'll write that up in a separate blog post in the future.

Thanks for reading, bye for now!
