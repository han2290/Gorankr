class PostsController < ApplicationController
    before_action :set_post, only: [:show, :edit, :update]
    
    
    
    def index
        category = Category.find_by_game_name(params[:game_name]).id
        @posts = Post.where(category_id: category)
    end
    
    def show
    end
    
    def edit
    end
    
    def update
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
    end
    
    def upload_image
        @image = Image.create(image_path: params[:upload][:image])
        render json: @image
    end
    
    private
    
    def set_post
    end
    
    def post_params
       params.require(:post).permit(:title, :content)
    end
        
end
