# Souped-ERC20-Subgraph

**Creating & Deploying a Subgraph**

*Note: you need to install the graph-cli: `yarn global add @graphprotocol/graph-cli`*
- Initialize a project from an existing contract (or example project): `graph init`.
- Create a GraphQL Schema by defining entities for structs and the different events you'd like to keep track of.
- Write your mapping functions in `src/mapping.ts` for each event handler defined in `subgraph.yaml` under `mapping.eventHandlers`.

**Resources Used**
- https://thegraph.com/docs/define-a-subgraph
- https://graphql.org/learn/queries/
- https://graphql.org/learn/schema/
- https://thegraph.com/docs/deploy-a-subgraph#create-a-graph-explorer-account
