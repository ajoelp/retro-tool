/* istanbul ignore file */
import OAuth2Strategy from 'passport-oauth2';
import util from 'util';

type Options = {
  clientID?: string;
  clientSecret?: string;
  callbackURL?: string;
  authorizationURL?: string;
  tokenURL?: string;
  scopeSeparator?: string;
  customHeaders?: Record<string, string>;
  userAgent?: string;
  name?: string;
  userProfileURL?: string;
  userEmailURL?: string;
  allRawEmails?: string;
  userOrgsURL?: string;
};
type Verify = any;

function GithubStrategy(options: Options = {}, verify: Verify) {
  options.authorizationURL =
    options.authorizationURL ?? 'https://github.com/login/oauth/authorize';
  options.tokenURL =
    options.tokenURL ?? 'https://github.com/login/oauth/access_token';
  options.scopeSeparator = options.scopeSeparator || ',';
  options.customHeaders = options.customHeaders || {};

  if (!options.customHeaders['User-Agent']) {
    options.customHeaders['User-Agent'] =
      options.userAgent || 'passport-github';
  }

  OAuth2Strategy.call(this, options, verify);

  this.name = options.name ?? 'github';
  this._userProfileURL =
    options.userProfileURL || 'https://api.github.com/user';
  this._userEmailURL =
    options.userEmailURL || 'https://api.github.com/user/emails';
  this._userOrgsURL = options.userOrgsURL || 'https://api.github.com/user/orgs';
  this._oauth2.useAuthorizationHeaderforGET(true);
  this._allRawEmails = options.allRawEmails || false;
}

util.inherits(GithubStrategy, OAuth2Strategy);

GithubStrategy.prototype.getUser = function (accessToken: string) {
  return new Promise((resolve, reject) => {
    this._oauth2.get(this._userProfileURL, accessToken, (err, body) => {
      if (err) return reject(err);
      resolve(JSON.parse(body));
    });
  });
};

GithubStrategy.prototype.getEmails = function (accessToken: string) {
  return new Promise((resolve, reject) => {
    this._oauth2.get(this._userEmailURL, accessToken, (err, body) => {
      if (err) return reject(err);
      resolve(JSON.parse(body));
    });
  });
};

function Profile(user: any, emails: any[], organizations: any[]) {
  return {
    id: user.id,
    githubNickname: user.login,
    email: emails.find((email) => email.primary === true).email,
    organizations: organizations.map((org) => org.login),
    avatar: user.avatar_url,
  };
}

GithubStrategy.prototype.getOrganizations = function (accessToken: string) {
  return new Promise((resolve, reject) => {
    this._oauth2.get(this._userOrgsURL, accessToken, (err, body) => {
      if (err) return reject(err);
      resolve(JSON.parse(body));
    });
  });
};

GithubStrategy.prototype.userProfile = async function (accessToken, done) {
  try {
    const user = await this.getUser(accessToken);
    const emails = await this.getEmails(accessToken);
    const organizations = await this.getOrganizations(accessToken);

    done(null, Profile(user, emails, organizations));
  } catch (e) {
    done(e, null);
  }
};

export { GithubStrategy };
