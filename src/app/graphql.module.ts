import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClientOptions, InMemoryCache, ApolloLink } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import * as Realm from "realm-web";
import { setContext } from '@apollo/client/link/context';
import { environment } from './../environments/environment';

const { APP_ID, GRAPHQL_URI, API_KEY } = environment;

const app = new Realm.App(APP_ID);


async function getValidAccessToken() {

  if (!app.currentUser) {

    const credentials = Realm.Credentials.apiKey(API_KEY);
    await app.logIn(credentials);
  } else {
  
    await app.currentUser.refreshCustomData();
  }
  return app.currentUser! .accessToken;
}

export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
    const http = httpLink.create({ uri: GRAPHQL_URI });

    const auth = setContext(async () => {
      const token = await getValidAccessToken();
    
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    });

    const link = auth.concat(http);

    return {
      link,
      cache: new InMemoryCache(),
    };
}

@NgModule({
  exports: [ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule { }
