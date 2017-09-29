import PropTypes from 'prop-types'
import * as React from 'react'
import components from '@artsy/reaction-force/dist/components/publishing/index'
import colors from '@artsy/reaction-force/dist/assets/colors'
import styled from 'styled-components'
import Waypoint from 'react-waypoint'
import _ from 'underscore'
import articlesQuery from '../queries/articles.js'
import positronql from 'desktop/lib/positronql.coffee'
import { data as sd } from 'sharify'
const { Article } = components

export default class InfiniteScrollArticle extends React.Component {
  static propTypes = {
    article: PropTypes.object,
    emailSignupUrl: PropTypes.string
  }

  constructor (props) {
    super(props)
    this.state = {
      isLoading: false,
      articles: [this.props.article],
      offset: 0,
      error: false
    }
  }

  fetchNextArticles = async () => {
    this.setState({ isLoading: true })
    try {
      const data = await positronql({ query: articlesQuery(this.state.offset, 3, sd.ARTSY_EDITORIAL_CHANNEL, this.props.article.id) })
      this.setState({
        articles: this.state.articles.concat(data.articles),
        isLoading: false,
        offset: this.state.offset + 3
      })
    } catch (error) {
      this.setState({ isLoading: false, error: true })
    }
  }

  renderWaypoint = () => {
    if (!this.state.isLoading) {
      return <Waypoint onEnter={this.fetchNextArticles} threshold={2.0} />
    } else if (!this.state.error) {
      return (
        <LoadingSpinner>
          <div className='loading-spinner' />
        </LoadingSpinner>
      )
    }
  }

  renderContent = () => {
    return _.flatten(_.map(this.state.articles, (article, i) => {
      return (
        <div key={`article-${i}`}>
          <Article article={article} relatedArticlesForPanel={article.relatedArticlesPanel} relatedArticlesForCanvas={article.relatedArticlesCanvas} isTruncated={i !== 0} emailSignupUrl={this.props.emailSignupUrl} />
          <Break />
        </div>
      )
    }))
  }

  render () {
    return (
      <InfiniteScrollContainer id='article-root'>
        {this.renderContent()}
        {this.renderWaypoint()}
      </InfiniteScrollContainer>
    )
  }
}

const LoadingSpinner = styled.div`
  position: relative;
  padding: 100px;
`
const Break = styled.div`
  border-top: 1px solid ${colors.grayRegular};
  width: 100%;
`
const InfiniteScrollContainer = styled.div`
  margin-top: 100px;
`