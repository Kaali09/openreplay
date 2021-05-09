import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import withRequest from 'HOCs/withRequest';
import { Popup, Dropdown, Icon, IconButton } from 'UI';
import { pause } from 'Player';
import styles from './sharePopup.css';

@connect(state => ({
  channels: state.getIn([ 'slack', 'list' ]),
  tenantId: state.getIn([ 'user', 'client', 'tenantId' ]),
}))
@withRequest({
  endpoint: ({ id, entity }, integrationId) => 
    `/integrations/slack/notify/${ integrationId }/${entity}/${ id }`,
  method: "POST",
})
export default class SharePopup extends React.PureComponent {
  state = {
    comment: '',
    isOpen: false,
    channelId: this.props.channels.getIn([ 0, 'id' ]),
  }

  editMessage = e => this.setState({ comment: e.target.value })
  share = () => this.props.request({ comment: this.state.comment }, this.state.channelId)
    .then(this.handleSuccess)

  handleOpen = () => {
    this.setState({ isOpen: true });
    pause();
    setTimeout(function() {
      document.getElementById('message').focus();
    }, 100)
  }

  handleClose = () => { 
    this.setState({ isOpen: false, comment: '' });
  }

  handleSuccess = () => {
    toast.success('Your comment is shared.');
    this.handleClose();
  }

  changeChannel = (e, { value }) => this.setState({ channelId: value })

  render() {
    const { trigger, loading, channels, tenantId } = this.props;
    const { comment, isOpen, channelId } = this.state;

    const options = channels.map(({ id, name }) => ({ value: id, text: name })).toJS();
    return (
      <Popup
        open={ isOpen }
        onOpen={ this.handleOpen }
        onClose={ this.handleClose }
        trigger={ trigger }
        content={ 
          <div className={ styles.wrapper }>
            <div className={ styles.header }>
              <div className={ styles.title }>{ 'Comment' }</div>
            </div>
            { options.length === 0 ?
              <div className={ styles.body }>
                <a 
                  href={ `https://slack.com/oauth/authorize?client_id=252578014882.345694377157&scope=incoming-webhook&state=${ tenantId }` }
                  target="_blank"
                >
                  <IconButton className="my-auto mt-2 mb-2" icon="integrations/slack" label="Integrate Slack" />
                </a>
              </div>
            :
              <div>
                <div className={ styles.body }>
                  <textarea
                    name="message"
                    id="message"
                    cols="30"
                    rows="6"
                    resize="none"
                    onChange={ this.editMessage }
                    value={ comment }
                    placeholder="Type here..."
                    className="p-4"
                  />
                </div>
                <div className={ styles.footer }>
                  <Dropdown
                    selection
                    options={ options } 
                    value={ channelId } 
                    onChange={ this.changeChannel }
                    className="mr-4"
                  />
                  <div>
                    <button
                      className={ styles.shareButton }
                      onClick={ this.share }
                    >
                      <Icon name="integrations/slack" size="18" marginRight="10" />
                      { loading ? 'Sharing...' : 'Share' }
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
        on="click"
        position="top center"
        className={ styles.popup }
        hideOnScroll
      />
    );
  }
}