const axios = require('axios')

const DEVELOPMENT_TEAM=6;

class Tempo {
  constructor({token, version = 2}) {
    this.version = version
    this.client = new axios.create({
      baseURL: 'https://api.tempo.io/' + this.version,
      headers: {'Authorization': 'Bearer ' + token}
    })
  }

  /**
   * Returns members of development team
   * @return {Object} {self, username, displayName}
   */
  async members() {
    let response = await this.client.get('teams/' + DEVELOPMENT_TEAM + '/members')
    return response.data.results.map((m) => {
      return m.member
    })
  }

  async plans({username, from, to}) {
    let response = await this.client.get('plans/user/' + username, {
      params: {from, to}
    })
    return response.data.results
  }

  async worklogs({username, from, to}) {
    let response = await this.client.get('worklogs/user/' + username, {
      params: {from, to}
    })
    return response.data.results
  }

  async accounts() {
    let response = await this.client.get('accounts', {params: {status: 'OPEN'}})
    return response.data.results
  }

  async schedule({username, from, to}) {
    let response = await this.client.get('/user-schedule/' + username, {
      params: {from, to}
    })
    return response.data.results
  }

  async accountProjectIds(key){
    let response = await this.client.get(['accounts', key, 'links'].join('/'))
    return response.data.results.filter(r => r.scope.type === 'PROJECT').map(r => {
      return r.scope.id
    })
  }
}

module.exports = Tempo
