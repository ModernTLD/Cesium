# Courtesy of @theos-space
CREATE TABLE user_to_domain (
  id                    INT AUTO_INCREMENT,
  user                  VARCHAR(255),
  domain                VARCHAR(255),
  nameserver            VARCHAR(255),
  PRIMARY KEY (id)
) Engine=InnoDB;

