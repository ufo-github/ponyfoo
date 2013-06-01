TODO
=======

1
-------

- Email verification flow for new accounts using ancient login
    - flash email sent message in green, make reusable (extract from login.js)
    - server side stuff (
        accept the tokens,
        validate token,
        validate still not created,
        mark token as used,
        create actual user [password stuff],
        log him in,
        redirect
    )


- reset password email flow
- fix logon issues when using providers


- integrate login on the market level

- blog claim path
  - step to register or login
  - existing bloggers can't claim additional blog slugs
  - Go.


- option to resend verification email token

2
-------

- save drafts to localStorage
- allow saving drafts to backend
- integrate twitter broadcasts
- integrate email subscriptions
- redesign commenting infrastructure (which blows)

- refactor:
    - drop crudService
    - refactor authenticationController, feedController
    - refactor api controllers, move logic to services, rename exports more semantically
    - css lint (and different classing philosophy)



3
-------

- client-side caching?
- proper api authentication?