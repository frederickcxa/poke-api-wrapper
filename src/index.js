const { GraphQLServer } = require('graphql-yoga');
const axios = require('axios');
const BASE_API = 'https://pokeapi.co/api/v2';
const PATH_POKEMON = 'pokemon';

const getPokemonPromise = (url) => {
  return axios.get(url)
    .then((result) => result.data)
    .then(({ id, order, name, sprites: { front_default, back_default }, types }) => ({
      id,
      order,
      name,
      frontImage: front_default,
      backImage: back_default,
      types: types.map(({ type }) => type.name)
    }))
    .catch(() => null);
};

const resolvers = {
  Query: {
    pokemons: (root, args) => {
      const { offset, limit } = args;
      const max = offset + limit;
      const urls = Array.from({ length: max }, (v, index) => [BASE_API, PATH_POKEMON, index + 1].join('/'));
      const promises = urls.map((url) => getPokemonPromise(url));

      return Promise.all(promises);
    },
    pokemonById: (root, args) => {
      const url = [BASE_API, PATH_POKEMON, args.id].join('/');

      return getPokemonPromise(url);
    }
  }
};

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers
});

server.start(() => console.log('Server running on localhost:4000!'));
