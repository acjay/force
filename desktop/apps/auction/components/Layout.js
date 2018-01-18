import ArtworkBrowser from 'desktop/apps/auction/components/artwork_browser/ArtworkBrowser'
import AuctionBlock from 'desktop/components/react/auction_block/auction_block'
import AuctionInfoContainer from 'desktop/apps/auction/components/layout/auction_info'
import Banner from 'desktop/apps/auction/components/layout/Banner'
import Footer from 'desktop/apps/auction/components/layout/Footer'
import GridArtwork from 'desktop/apps/auction/components/artwork_browser/main/artwork/GridArtwork'
import MyActiveBids from 'desktop/apps/auction/components/layout/active_bids/MyActiveBids'
import PropTypes from 'prop-types'
import React from 'react'
import get from 'lodash.get'
import { Artwork } from '@artsy/reaction-force/dist/Components/Artwork'
import { ArtworkRail } from './layout/artwork_rail/ArtworkRail'
import { RelayStubProvider } from 'desktop/components/react/RelayStubProvider'
import { connect } from 'react-redux'

function Layout (props) {
  const {
    associatedSale,
    buyNowSaleArtworks,
    saleArtworksByFollowedArtists,
    showAssociatedAuctions,
    showFilter,
    showFollowedArtistsRail,
    showInfoWindow,
    showMyActiveBids,
    showFooter
  } = props

  return (
    <div className='auction-page'>
      <Banner />

      <div className='main-layout-container responsive-layout-container'>
        <AuctionInfoContainer />

        { showAssociatedAuctions &&
          <AuctionBlock
            sale={associatedSale}
            relatedAuction
          />
        }

        { showMyActiveBids &&
          <MyActiveBids />
        }

        { buyNowSaleArtworks &&
          <RelayStubProvider>
            <ArtworkRail
              title='Buy Now'
              artworks={buyNowSaleArtworks}
              getArtworkBrick={({ artwork }) => {
                console.log(artwork)
                return (
                  <Artwork artwork={artwork} />
                )
              }}
            />
          </RelayStubProvider>
        }

        { showFollowedArtistsRail &&
          <ArtworkRail
            title='Works By Artists You Follow'
            artworks={saleArtworksByFollowedArtists}
            getArtworkBrick={artwork => {
              return (
                <GridArtwork saleArtwork={artwork} />
              )
            }}
            style={{
              height: 525
            }}
          />
        }

        { showFilter && !showInfoWindow &&
          <div className='auction-main-page'>
            <ArtworkBrowser />
          </div>
        }

        {showFooter &&
          <Footer />
        }
      </div>
    </div>
  )
}

Layout.propTypes = {
  associatedSale: PropTypes.object,
  buyNowSaleArtworks: PropTypes.array.isRequired,
  saleArtworksByFollowedArtists: PropTypes.array.isRequired,
  showAssociatedAuctions: PropTypes.bool.isRequired,
  showFilter: PropTypes.bool.isRequired,
  showFollowedArtistsRail: PropTypes.bool.isRequired,
  showInfoWindow: PropTypes.bool.isRequired,
  showMyActiveBids: PropTypes.bool.isRequired,
  showFooter: PropTypes.bool.isRequired
}

const mapStateToProps = (state) => {
  const {
    app: { articles, auction, me, isMobile, showInfoWindow },
    artworkBrowser: {
      saleArtworksByFollowedArtists
    }
  } = state

  const {
    associated_sale,
    eligible_sale_artworks_count,
    is_open,
    is_live_open
  } = auction.toJSON()

  const showAssociatedAuctions = Boolean(!isMobile && associated_sale)
  const showFilter = Boolean(eligible_sale_artworks_count > 0)
  const showFollowedArtistsRail = Boolean(!isMobile && state.artworkBrowser.showFollowedArtistsRail)
  const showMyActiveBids = Boolean(me && me.bidders.length && is_open && !is_live_open)
  const showFooter = Boolean(!isMobile && articles.length || !showFilter)
  const buyNowSaleArtworks = get(state.app.auction.toJSON(), 'promoted_sale.sale_artworks', [])

  return {
    associatedSale: associated_sale,
    buyNowSaleArtworks: buyNowSaleArtworks.concat(buyNowSaleArtworks),
    saleArtworksByFollowedArtists,
    showAssociatedAuctions,
    showFilter,
    showFollowedArtistsRail,
    showInfoWindow,
    showMyActiveBids,
    showFooter
  }
}

export default connect(
  mapStateToProps
)(Layout)
