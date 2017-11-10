import React from 'react';
import axios from 'axios';
import Comment from './Comment';

class SinglePost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            post: {},
            postAuthor: {},
            comments: [],
            content: '',
            commentOpen: false,
            message: '',
            votes: ''
        };
    }

    componentWillMount() {
        const path = this.props.match.params.id;
        axios.get(`/api/post/${path}`)
        .then(result => {
            console.log(result);
            var votes = result.data.post.votes ? result.data.post.votes.reduce((sum, val)=>(sum + parseInt(val.up)), 0) : 0;
            this.setState({
                post: Object.assign({}, result.data.post),
                postAuthor: result.data.post.user,
                comments: result.data.post.children,
                votes: votes
            });
        })
          .catch(err => {
              console.log('error: ', err);
          });
    }

    onContentChange(e) {
        this.setState({
            content: e.target.value
        });
    }

    async postComment() {
        try {
            const postId = this.props.match.params.id;
            await axios.post('/api/post/new', { parentId: postId, content: this.state.content });
            this.setState({
                comments: this.state.comments.concat({content: this.state.content, createdAt: 'just now', user: 'you', votes: 0}),
                content: '',
                commentOpen: false
            });
        } catch (e) {
            console.log('error: ', e);
            this.setState({
                message: e.response.data.error
            });
        }
    }

    async vote(id, value) {
        try {
            const result = await axios.post('/api/post/vote', { postId: id, vote: value });
            console.log('vote result: ', result);
            if (result.data.new) {
                this.setState({ votes: value === '1' ? this.state.votes + 1 : this.state.votes - 1 });
            } else if (result.data.changed) {
                this.setState({votes: value === '1' ? this.state.votes + 2 : this.state.votes - 2});
            } else {
                console.log('already voted that direction');
            }
        } catch (e) {
            this.setState({ message: e.response.data.error });
        }
    }

    render() {
        return (
          <div className="singlepost" style={{ marginLeft: 20 }}>
            {this.state.message ? <div>{this.state.message}</div> : null}
            <div className="postbox" style={{ borderRadius: 5, border: '1px solid gray', padding: 5}}>
              <div className="postcontent">
                <div><b>{this.state.post.title}</b></div>
                <div>by: {this.state.postAuthor.username}</div>
                <div><i>at {this.state.post.createdAt}</i></div>
                {this.state.post.createdAt !== this.state.post.updatedAt ? <div>(edited)</div> : null}
                <div>{this.state.post.content}</div>
              </div>
              <div className="postvotes" style={{ display: "flex" }}>
                <button onClick={() => this.vote(this.state.post.id, '1')}>+</button>
                <button onClick={() => this.vote(this.state.post.id, '-1')}>-</button>
                <div>{this.state.votes}</div>
              </div>
           </div>
            <div className="commentdiv">
              Comments ({this.state.comments.length})
              {this.state.comments.map((comment, id) => <Comment key={id} comment={comment} />)}
            </div>
            <button onClick={() => this.setState({ commentOpen: true })}>Make a comment</button>
            { this.state.commentOpen ?
              <div className="commentform">
                <textarea type="text" name="content" value={this.state.content} onChange={(e) => this.onContentChange(e)} />
                <button onClick={() => this.postComment()}>post</button>
              </div>
            : null }
          </div>
        );
    }
}

export default SinglePost;
