# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["urls - login page"](https://github.com/kowo0403hk/tinyapp/blob/master/docs/urls-login.png?raw=true)
!["urls - registration page with warning message"](https://github.com/kowo0403hk/tinyapp/blob/master/docs/urls-registration-warning.png?raw=true)
!["urls - main page when logged in"](https://github.com/kowo0403hk/tinyapp/blob/master/docs/urls.png?raw=true)
!["urls - main page with encrypted cookies"](https://github.com/kowo0403hk/tinyapp/blob/master/docs/urls-encryptedCookies.png?raw=true)
!["urls - shortURL page when logged in (with the ability to update the link)"](https://github.com/kowo0403hk/tinyapp/blob/master/docs/urls-shortURL-loggedIn.png?raw=true)
!["urls - shortURL page when logout"](https://github.com/kowo0403hk/tinyapp/blob/master/docs/urls-shortURL-Logout.png?raw=true)


## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- body-parser
- cookie-session
- method-override
- chai
- mocha
- nodemon
- morgan


## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Functionality 

- The web application provides users an interface which shows the shortened URL, the original URL, dare created, total visits of the URL and the unique number of visits of the URL based on remnote address of client. 

- Everyone can see the shortURL page, but only the owner of the shortURL can update/delete it. 

- Method-override is inplemented in this web application.

- Helper functions are modularized in a separate document.