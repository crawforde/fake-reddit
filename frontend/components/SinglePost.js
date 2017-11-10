import React from 'react';
import Router from 'react-router-dom';
import axios from 'axios';

class SinglePost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            post: {},
            postAuthor: {},
            comments: [],
            content: '',
            commentOpen: false,
            message: ''
        };
    }

    componentWillMount() {
        const path = this.props.match.params.id;
        axios.get(`/api/post/${path}`)
        .then(result => {
          console.log(result);
            this.setState({
                post: Object.assign({}, result.data.post),
                postAuthor: result.data.post.user,
                comments: result.data.comments
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
            await axios.post('/api/post/new', { postId: postId, content: this.state.content });
            this.setState({
                comments: this.state.comments.concat({content: this.state.content, createdAt: 'just now', user: 'you'}),
                content: '',
                commentOpen: false
            })
        } catch (e) {
            console.log('error: ', e);
            this.setState({
                message: e.response.data.error
            });
        }
    }

    render() {
        return (
          <div className="singlepost" style={{ marginLeft: 20 }}>
            {this.state.message ? <div>{this.state.message}</div> : null}
            <div className="postbox" style={{ borderRadius: 5, border: '1px solid gray', padding: 5}}>
              <div><b>{this.state.post.title}</b></div>
              <div>by: {this.state.postAuthor.username}</div>
              <div><i>at {this.state.post.createdAt}</i></div>
              {this.state.post.createdAt !== this.state.post.updatedAt ? <div>(edited)</div> : null}
              <div>{this.state.post.content}</div>
           </div>
            <div className="commentdiv">
              Comments ({this.state.comments.length})
              {this.state.comments.map((comment, id) =>
                <div className="eachcomment" style={{ borderRadius: 5, border: '1px solid gray', padding: 5}} key={id}>
                  <div><b>{comment.user.username ? comment.user.username : comment.user}</b></div>
                  <div>{comment.content}</div>
                  <div><i>at: {comment.createdAt}</i></div>
                </div>)}
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
