# Authorization and Authentication in Serverless

This project provides authentication and authorization for serverless  enviroment.
Authentication is done through Google Login or Username and Password. For authorization i am using custom lambda authorizer which allow access to the back end lambda function only if the user have the valid access token.

I am using JWT Tokens for access tokens and httpOnly cookie for refresh token. Life span of the access token is 5 minutes and refresh token is 30 days. Refresh tokens are used for retriving access token when the current access token becomes invalid.
JWT Tokens are signed using RSA_4096 key which is stored in AWS KMS.


All the backend setup is written terraform.

### Routes for the authentication
1.  **GET /auth/google** - for authenticating user with their google account.
2.  **POST /username_password-signup** -  signup user using username and password.
3.  **POST /username_password-login** - login user using username and password.
4.   **GET /getAccessToken**  - to get access token using refresh tokens.
5.   **GET /logout** - to logout user



## Setup

### Google Api Keys
Go to the google developer console and get secret keys for OAuth 2.0 . When creating keys leave authorized javascript origins and authorized redirect URl . This we will going to write after our terraform is created.

Place your  keys in the code below.
```
variable.tf

variable "clientID" {
  type = string
  description = "google auth2.0 client id"
  default = your_client_id
}

variable "clientSecret" {
  type  = string
  description = "google auth2.0 client secret"
  default = your_client_secert
}
```



### Terraform
Go to the your directory where you downloaded the repository and write following commands.
```
terraform init
```
```
terraform apply -target module.kms_key --auto-approve
```
```
terraform apply --auto-approve
```

After the completion you will get a Api Gateway end point in the terminal . Go to the Google Developer Console and in the authorized javascript origin write the domain (eg. https://smha2lwl8t.execute-api.us-east-1.amazonaws.com) and in the authorised callback url write  (eg. https://smha2lwl8t.execute-api.us-east-1.amazonaws.com/dev/auth/google/callback).



You can change some default configuration in variable.tf.
1. jwt expiry 
2. origin
3. redirect url



### React Client
Go inside client directory and write the following commands.
```
npm install
```
```
npm start
```

Go to the localhost:3000 where your client is running.

