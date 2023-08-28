import http from "k6/http";
import { check, group, sleep } from "k6";

const data = JSON.parse(open("./data.json"));

const username_admin = `${__ENV.username_admin}`;
const password_admin = `${__ENV.password_admin}`;

const baseUrl = 'http://begemotik.top'

const authorLoop = 2;
const editorLoop = 2;

// export const options = {
//   vus: 2,
//   duration: '40s',
// };

export default function() {
group("Created Users", function() {
    group("Main Page", function() {
        let res = http.get(`${baseUrl}/`);
        check(res, {
          "status code is 200": (res) => res.status == 200,
        });
        sleep(1);
      });
      group("Going to LogIn Page", function() {
        let res = http.get(`${baseUrl}/wp-login.php`);

        let regex = /<form name="(\D+)" id="(\D+)" action="http:\/\/begemotik\.top\/wp-login\.php" method="post">/;
        let login_page = res.body.match(regex);
    
        check(res, {
            "Checking the display of the authorization page": () => login_page[1] == 'loginform',
        });
        check(res, {
          "status code is 200": (res) => res.status == 200,
        });
        sleep(1);
      });
      group("LogIn", function() {
        let res = http.post(
            `${baseUrl}/wp-login.php`,
            {
              log: username_admin,
              pwd: password_admin,
              wp_submit: 'Log In',
              redirect_to: `${baseUrl}/wp-admin/`,
              testcookie: 1,
              redirects: 0
            }
          );
        let regex = /;_wpnonce=(.+?)'>Log Out</;
        let logout_nonce = res.body.match(regex);

        global.LogoutNonce = logout_nonce[1];

        let regex_2 = /Howdy, <span class="display-name">(.+?)<\/span>/;
        let match_username = res.body.match(regex_2);

        check(res, {
            "Checking that the admin is logged in": () => match_username[1] == username_admin,
        });        
        check(res, {
          "status code is 200": (res) => res.status == 200,
        });
        sleep(1);
      });
      group("Create Author Loop", function() {

        for (let i = 0; i < authorLoop; i++) {
          const username = data.author[i].username;
          const password = data.author[i].password;
          const role = data.author[i].role;

          group("Going to Users Page", function() {
            let res = http.get(`${baseUrl}/wp-admin/user-new.php`);

            let regex = /name="_wpnonce_create-user" value="(.+?)" \/>/;
            let new_user_nonce = res.body.match(regex);
            global.newUserNonce = new_user_nonce[1];
            
            let regex_2 = /<title>(\D+) .+; Load Testing Site\. .+; WordPress<\/title>/;
            let title_page = res.body.match(regex_2);

            check(res, {
              "Checking the display of the page title": () => title_page[1] == 'Add New User',
            });

            check(res, {
              "Status code is 200": (res) => res.status == 200,
            });
            sleep(1);
          });
          group("Creating Author", function() {
            const newUserNonce = global.newUserNonce;
            let wpnonce_create_user = '_wpnonce_create-user'

            let res = http.post(
                `${baseUrl}/wp-admin/user-new.php`,
                { 
                  action: 'createuser',
                  [wpnonce_create_user]: newUserNonce,
                  _wp_http_referer: '/wp-admin/user-new.php',
                  user_login: username,
                  email: `${username}@gmail.com`,
                  first_name: '',
                  last_name: '',
                  url: '',
                  pass1: password,
                  pass2: password,
                  role: role,
                  createuser: 'Add New User'
                }
              );

            let regex = /New user created/;
            let create_user = res.body.match(regex);
            
            let regex_2 = /<a href="http:\/\/begemotik\.top\/wp-admin\/user-edit\.php\?user_id=(\d+)&#038;/;
            let new_author_id = res.body.match(regex_2);
            global.NewAuthorId = new_author_id[1];
    
            check(res, {
                "Checking that author created": () => create_user == 'New user created',
            });   
    
            check(res, {
                "status code is 200": (res) => res.status == 200,
                });
            sleep(1);            
            });
          group("Validation of the created author", function() {
            const NewAuthorId = global.NewAuthorId;

            let res = http.get(
                `${baseUrl}/wp-admin/users.php`,
                { 
                  update: 'add',
                  id: NewAuthorId
                }
              );

            const verification_of_creation = `Created author with username-${username} and id-${NewAuthorId},Status code is 200`;

            check(res, {
              [verification_of_creation]: (res) => res.status == 200,
                }); 
            sleep(1);         
            });
          }
      });
      group("Create Editors Loop", function() {

        for (let i = 0; i < editorLoop; i++) {
          const username = data.editors[i].username;
          const password = data.editors[i].password;
          const role = data.editors[i].role;

          group("Going to Users Page", function() {
            let res = http.get(`${baseUrl}/wp-admin/user-new.php`);

            let regex = /name="_wpnonce_create-user" value="(.+?)" \/>/;
            let new_user_nonce = res.body.match(regex);
            global.newUserNonce = new_user_nonce[1];
            
            let regex_2 = /<title>(\D+) .+; Load Testing Site\. .+; WordPress<\/title>/;
            let title_page = res.body.match(regex_2);

            check(res, {
              "Checking the display of the page title": () => title_page[1] == 'Add New User',
            });

            check(res, {
              "Status code is 200": (res) => res.status == 200,
            });
            sleep(1);
          });
          group("Creating Editor", function() {
            const newUserNonce = global.newUserNonce;
            let wpnonce_create_user = '_wpnonce_create-user'

            let res = http.post(
                `${baseUrl}/wp-admin/user-new.php`,
                { 
                  action: 'createuser',
                  [wpnonce_create_user]: newUserNonce,
                  _wp_http_referer: '/wp-admin/user-new.php',
                  user_login: username,
                  email: `${username}@gmail.com`,
                  first_name: '',
                  last_name: '',
                  url: '',
                  pass1: password,
                  pass2: password,
                  role: role,
                  createuser: 'Add New User'
                }
              );

            let regex = /New user created/;
            let create_user = res.body.match(regex);
            
            let regex_2 = /<a href="http:\/\/begemotik\.top\/wp-admin\/user-edit\.php\?user_id=(\d+)&#038;/;
            let new_editor_id = res.body.match(regex_2);
            global.NewEditorId = new_editor_id[1];
            
            check(res, {
                "Checking that editor created": () => create_user == 'New user created',
            });   

            check(res, {
                "status code is 200": (res) => res.status == 200,
                });
            sleep(1);   
            });
            
          group("Validation of the created editor", function() {
            const NewEditorId = global.NewEditorId;

            let res = http.get(
                `${baseUrl}/wp-admin/users.php`,
                { 
                  update: 'add',
                  id: NewEditorId
                }
              );

            const verification_of_creation = `Created editor with username-${username} and id-${NewEditorId},Status code is 200`;
    
            check(res, {
              [verification_of_creation]: (res) => res.status == 200,
                });
            sleep(1);              
            });
          }
      });
      group("LogOut", function() {
        const LogoutNonce = global.LogoutNonce;
        let res = http.get(`${baseUrl}/wp-login.php`,

        { 
          action: 'logout',
          _wpnonce: LogoutNonce,
          redirects: 0
        }
        );
        let regex = /<title>(\D+) .+; Load Testing Site\. .+; WordPress<\/title>/;
        let title_page = res.body.match(regex);

        check(res, {
          "Checking the display of the page title": () => title_page[1] == 'Log In',
        });

        check(res, {
          "status code is 200": (res) => res.status == 200,
        });
        sleep(1);
      }); 
    });
  }
