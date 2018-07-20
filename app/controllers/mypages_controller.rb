class MypagesController < ApplicationController
    before_action :authenticate_user!
    def index
        @categories = Category.all
    end
    
    def editprofile
        if params[:avatar].nil?
            current_user.update(username: params[:username])
        else
            current_user.update(username: params[:username], avatar: params[:avatar])
        end
        redirect_to :back
    end
    
    def add_game
        Usersgame.create(user_id: current_user.id,
                        category_id: params[:category],
                        user_nickname: params[:usernickname])
        redirect_to :back
    end
    
    def destroy_game
        Usersgame.find(params[:usersgameid]).destroy
        redirect_to :back
    end
    
    def fetch_data
        puts "성공!!!!!!"
        case params[:category]
        when "lol"
            @game_data = fetch_lol_data
        when "ow"
            @game_data = fetch_ow_data
        when "pubg"
            @game_data = fetch_pubg_data
        else
            puts "실패! 어떤 게임도 로드하지 못함"
        end
        
        puts "최종 데이터 확인"
        puts @game_data
        @data = "hello"
    end
    
    # 게임 데이터 가져오기
     def fetch_lol_data
        # 먼저 다른 정보를 가져오기 위한 소환사의 summonerId 와 accountId를 가져온다
        game_id = current_user.usersgames.find_by_category_id(Category.find_by_game_name("lol")).user_nickname
        url = URI.encode("https://kr.api.riotgames.com/lol/summoner/v3/summoners/by-name/#{game_id}?api_key=#{ENV["LOL_API_KEY"]}")
        puts "##########" + url
        user_lol_info = RestClient.get(url)
        user_lol_info = JSON.parse(user_lol_info)
        
        summonerId = user_lol_info["id"]
        accountId = user_lol_info["accountId"]
        
        # AccountId를 이용해 솔랭 게임의 정보를 가져온다
        url = URI.encode("https://kr.api.riotgames.com/lol/match/v3/matchlists/by-account/#{accountId}?queue=420&api_key=#{ENV["LOL_API_KEY"]}")
        user_lol_matches = RestClient.get(url)
        user_lol_matches = JSON.parse(user_lol_matches)
        user_lanes = []
        user_lol_matches["matches"].each do |match|
            user_lanes.push(match["lane"])
        end
        user_lanes = Hash[user_lanes.group_by(&:itself).map {|k,v| [k, v.size] }]
        user_lanes = user_lanes.sort_by {|k, v| v}.reverse
        pos1 = user_lanes[0][0]
        pos2 = user_lanes[1][0]
        
        # SummonerId를 이용해 티어를 가져온다
        url = URI.encode("https://kr.api.riotgames.com/lol/league/v3/positions/by-summoner/#{summonerId}?api_key=#{ENV["LOL_API_KEY"]}")
        user_lol_league = RestClient.get(url)
        user_lol_league = JSON.parse(user_lol_league)
        tier = user_lol_league[0]["tier"]
        
        return game_date = {"티어": tier, "주 포지션 1": pos1, "주 포지션 2": pos2}
        
    end
    
    def fetch_pubg_data
        # PubG opgg 점수 크롤링 
        game_id = current_user.usersgames.find_by_category_id(Category.find_by_game_name("pubg")).user_nickname
        url = "https://dak.gg/profile/" + game_id
        page = Nokogiri::HTML(open(url))
        soloMMR = page.xpath('//*[@id="profile"]/div[3]/div[1]/section[1]/div[1]/div[1]/div[2]/span[1]').text
        duoMMR = page.xpath('//*[@id="profile"]/div[3]/div[1]/section[2]/div[1]/div[1]/div[2]/span[1]').text
        squadMMR = page.xpath('//*[@id="profile"]/div[3]/div[1]/section[3]/div[1]/div[1]/div[2]/span[1]').text
        
        
        
        puts "------데이터-------"
        puts soloMMR
        puts duoMMR
        puts squadMMR
        
        return game_data = {"Solo MMR": soloMMR, "Duo MMR": duoMMR, "Squad MMR": squadMMR}   
    end
    
    def fetch_ow_data
        game_id = current_user.usersgames.find_by_category_id(Category.find_by_game_name("ow")).user_nickname
        puts "-----------"
        puts game_id
        ow_id = game_id.gsub("#","-")
        puts ow_id
        puts "-----------"
        
        # 오버와치 점수 가져오기
        url = URI.encode("https://www.overbuff.com/players/pc/" + ow_id)
        page = Nokogiri::HTML(open(url))
        mmr = page.css("span .player-skill-rating").text

        # 오버와치 포지션 가져오기
        url = URI.encode("https://www.overbuff.com/players/pc/" + ow_id + "?mode=competitive")
        page = Nokogiri::HTML(open(url))
        pos = page.xpath("/html/body/div[1]/div[3]/div/div[3]/div[2]/div[2]/div/section/article/table/tbody/tr[1]/td[1]/a/img").attr("alt").text
        
        return game_data = {"MMR": mmr, "주 포지션": pos}
    end
        
        
    
end
