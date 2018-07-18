class PostsController < ApplicationController
    def index
    end
    
    def show
    end
    
    def edit
    end
    
    def update
    end
    
    def new
        
    end
    
    def create
    end
    
    def destroy
    end
    
    def upload_image
        puts "---------------------------"
        
        @image = Image.create(image_path: params[:upload][:image])
        render json: @image
    end
        
end
