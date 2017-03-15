import * as actions from './actions'
import { combineReducers } from 'redux'
import { data as sd } from 'sharify'
import { contains } from 'underscore'
import u from 'updeep'

const initialState = {
  aggregatedArtists: [],
  aggregatedMediums: [],
  allFetched: false,
  currency: sd.AUCTION && sd.AUCTION.currency,
  filterParams: {
    aggregations: ['ARTIST', 'FOLLOWED_ARTISTS', 'MEDIUM', 'TOTAL'],
    artist_ids: [],
    estimate_range: '',
    gene_ids: [],
    include_artworks_by_followed_artists: false,
    page: 1,
    sale_id: sd.AUCTION && sd.AUCTION.id,
    size: 50,
    ranges: {
      estimate_range: {
        min: 0,
        max: 50000
      }
    },
    sort: 'position'
  },
  isFetchingArtworks: false,
  isListView: false,
  maxEstimateRangeDisplay: 50000,
  minEstimateRangeDisplay: 0,
  numArtistsYouFollow: 0,
  saleArtworks: [],
  sortMap: {
    "bidder_positions_count": "Number of Bids (asc.)",
    "-bidder_positions_count": "Number of Bids (desc.)",
    "position": "Lot Number (asc.)",
    "-position": "Lot Number (desc.)",
    "-searchable_estimate": "Most Expensive",
    "searchable_estimate": "Least Expensive"
  },
  total: 0,
  user: sd.CURRENT_USER
}

function auctionArtworks(state = initialState, action) {
  switch (action.type) {
    case actions.GET_ARTWORKS_FAILURE: {
      return u({
        isFetchingArtworks: false
      }, state)
    }
    case actions.GET_ARTWORKS_REQUEST: {
      return u({
        isFetchingArtworks: true
      }, state)
    }
    case actions.GET_ARTWORKS_SUCCESS: {
      return u({
        isFetchingArtworks: false
      }, state)
    }
    case actions.TOGGLE_ARTISTS_YOU_FOLLOW: {
      return u({
        filterParams: {
          include_artworks_by_followed_artists: !state.filterParams.include_artworks_by_followed_artists
        }
      }, state)
    }
    case actions.TOGGLE_LIST_VIEW: {
      return u({
        isListView: action.payload.isListView
      }, state)
    }
    case actions.UPDATE_AGGREGATED_ARTISTS: {
      return u({
        aggregatedArtists: action.payload.aggregatedArtists
      }, state)
    }
    case actions.UPDATE_AGGREGATED_MEDIUMS: {
      return u({
        aggregatedMediums: action.payload.aggregatedMediums
      }, state)
    }
    case actions.UPDATE_ALL_FETCHED: {
      if (state.saleArtworks.length === state.total) {
        return u({
          allFetched: true
        }, state)
      } else {
        return u({
          allFetched: false
        }, state)
      }
    }
    case actions.UPDATE_ARTIST_ID: {
      const artistId = action.payload.artistId
      if (artistId === 'artists-all') {
        return u({
          filterParams: {
            artist_ids: []
          }
        }, state)
      } else if (contains(state.filterParams.artist_ids, artistId)) {
        return u({
          filterParams: {
            artist_ids: u.reject((aa) => aa === artistId)
          }
        }, state)
      } else {
        return u({
          filterParams: {
            artist_ids: state.filterParams.artist_ids.concat(artistId)
          }
        }, state)
      }
    }
    case actions.UPDATE_ESTIMATE_DISPLAY: {
      return u({
        minEstimateRangeDisplay: action.payload.min,
        maxEstimateRangeDisplay: action.payload.max
      }, state)
    }
    case actions.UPDATE_ESTIMATE_RANGE: {
      return u({
        filterParams: {
          estimate_range: `${action.payload.min * 100}-${action.payload.max * 100}`
        }
      }, state)
    }
    case actions.UPDATE_MEDIUM_ID: {
      const mediumId = action.payload.mediumId
      if (mediumId === 'mediums-all') {
        return u({
          filterParams: {
            gene_ids: []
          }
        }, state)
      } else if (contains(state.filterParams.gene_ids, mediumId)) {
        return u({
          filterParams: {
            gene_ids: u.reject((mm) => mm === mediumId)
          }
        }, state)
      } else {
        return u({
          filterParams: {
            gene_ids: state.filterParams.gene_ids.concat(mediumId)
          }
        }, state)
      }
    }
    case actions.UPDATE_NUM_ARTISTS_YOU_FOLLOW: {
      return u({
        numArtistsYouFollow: action.payload.numArtistsYouFollow
      }, state)
    }
    case actions.UPDATE_PAGE: {
      const reset = action.payload.reset
      if (reset === true) {
        return u({
          filterParams: {
            page: 1
          }
        }, state)
      } else {
        const currentPage = state.filterParams.page
        return u({
          filterParams: {
            page: currentPage + 1
          }
        }, state)
      }
    }
    case actions.UPDATE_SALE_ARTWORKS: {
      if (state.filterParams.page > 1) {
        return u({
          saleArtworks: state.saleArtworks.concat(action.payload.saleArtworks)
        }, state)
      } else {
        return u({
          saleArtworks: action.payload.saleArtworks
        }, state)
      }
    }
    case actions.UPDATE_SORT: {
      return u({
        filterParams: {
          sort: action.payload.sort
        }
      }, state)
    }
    case actions.UPDATE_TOTAL: {
      return u({
        total: action.payload.total
      }, state)
    }
    default: return state
  }
}

export default combineReducers({
  auctionArtworks
})