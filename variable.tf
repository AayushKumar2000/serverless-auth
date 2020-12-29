# provides the value for first two variable
# change the default value if you want to change

variable "clientID" {
  type = string
  description = "google auth2.0 client id"
}

variable "clientSecret" {
  type  = string
  description = "google auth2.0 client secret"
}

variable "origin" {
  type = string
  default = "http://localhost:3000"
  description = "domain where your application is running"
}

variable "redirect_url" {
  default = "http://localhost:3000"
  type = string
  description = "after google authentication where user will redirect"
}

variable "jwt_expire" {
  default = 5
  type = number
  description = " expiry time for jwt token in minutes"
}
