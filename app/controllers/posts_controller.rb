class PostsController < ApplicationController
    before_action :set_post, only: [:show, :edit, :update, :destroy, :create_comment]
    before_action :authenticate_user!
    
    
    def index
        @game_name = params[:game_name]
        category = Category.find_by_game_name(@game_name).id
        
        @posts = Post.where(category_id: category)
    end
    
    def show
        @user = User.find(@post.user_id)
    end
    
    def edit
        unless current_user.id == @post.user_id
            redirect_to :back
        end
    end
    
    def update
        Post.update(post_params)
        puts :back
        redirect_to "/boards/#{@post.category.game_name}/#{@post.id}"
    end
    
    def new
        @post = Post.new
    end
    
    def create
        @post = Post.new(post_params)
        @post.user_id = current_user.id
        @post.username = current_user.username
        @post.category_id = Category.find_by_game_name(params[:game_name]).id
        if @post.save
            puts "/boards/#{@post.category.game_name}/#{@post.id}"
          redirect_to "/boards/#{@post.category.game_name}/#{@post.id}", flash: {success: "Post Created"}
        else
          render :new
        end
    end
    
    def destroy
        unless current_user.id == @post.user_id
            redirect_to :back
        else
            @post.destroy
            redirect_to "/boards/#{params[:game_name]}"    
        end
        
        
    end
    
    def upload_image
        @image = Image.create(image_path: params[:upload][:image])
        render json: @image
    end
    
    
    
    # comment
    def create_comment
        @comment = Comment.create(user_id: current_user.id, post_id: @post.id, content: params[:content])
        redirect_to :back
    end
    
    def update_comment
        @comment = Comment.find(params[:comment_id])
        @comment.update(content: params[:content])
        
        redirect_to :back
        
    end
    
    def destroy_comment
        @comment = Comment.find(params[:comment_id]).destroy
        
        redirect_to :back
    end
    
    
    private
    
    def set_post
        @post = Post.find(params[:id])
    end
    
    def post_params
       params.require(:post).permit(:title, :content)
    end
        
end
