import os
import re
import yaml
import pymysql
import requests
from mysql_const import MYSQL_CONST

BASE_DIR = 'D:\MyWorks\ccbcarchive\ccbcarchive\public\ccbc13'

def read_from_db(sql):
    # 连接数据库
    dbconn = pymysql.connect(host=MYSQL_CONST['host'],
                             port=MYSQL_CONST['post'],
                             user=MYSQL_CONST['user'],
                             password=MYSQL_CONST['pass'],
                             db=MYSQL_CONST['db'], charset='utf8')
    
    cursor = dbconn.cursor()

    # 读取数据
    cursor.execute(sql)
    data = cursor.fetchall()
    cursor.close()
    dbconn.close()
    return data

def parse_problem(row):
    # 解析数据
    problem = {}
    problem['pid'] = row[0]
    problem['pgid'] = row[1]
    problem['type'] = row[2]
    problem['title'] = row[3]
    problem['extend_data'] = row[4]
    problem['content'] = row[5]
    problem['image'] = row[6]
    problem['html'] = row[7]
    problem['answer_type'] = row[8]
    problem['answer'] = row[9]
    problem['jump_keyword'] = row[10]
    problem['extend_content'] = row[11]
    problem['desc'] = row[12]
    problem['attempts_count'] = row[13]
    problem['analysis'] = row[14]
    problem['script'] = row[15]
    problem['dt_update'] = row[16]

    return problem

def parse_puzzle_tips(row):
    puzzle_tips = {}
    puzzle_tips['ptid'] = row[0]
    puzzle_tips['pid'] = row[1]
    puzzle_tips['title'] = row[2]
    puzzle_tips['content'] = row[3]
    puzzle_tips['desc'] = row[4]
    puzzle_tips['point_cost'] = row[5]
    puzzle_tips['unlock_delay'] = row[6]
    puzzle_tips['order'] = row[7]

    return puzzle_tips

def parse_additional_answers(row):
    additional_answers = {}
    additional_answers['aaid'] = row[0]
    additional_answers['pid'] = row[1]
    additional_answers['answer'] = row[2]
    additional_answers['message'] = row[3]
    additional_answers['extra'] = row[4]

    return additional_answers

def download_image(image_url, image_path):
    # 下载图片到本地
    if not os.path.exists(image_path):
        os.makedirs(image_path)
    image_name = image_url.split('/')[-1]
    local_url = "/ccbc13/images/%s/%s" % (image_path.split('\\')[-1], image_name)

    local_path = os.path.join(image_path, image_name)

    print("Downloading image %s" % image_url)
    #使用requests库下载图片
    response = requests.get(image_url)
    with open(local_path, 'wb') as f:
        f.write(response.content)
    return local_url

def get_download_images(content, image_path):
    # 提取所有 https://static.cipherpuzzles.com/static/...webp 的图片链接
    image_urls = re.findall(r'https://static.cipherpuzzles.com/static/.*?(?:webp|m4a|mp4)', content)
    for image_url in image_urls:
        # 下载图片到本地
        local_url = download_image(image_url, image_path)
        # 替换图片链接为本地链接
        content = content.replace(image_url, local_url)
    return content

def get_path_area(problem):
    path_area_dict = {
        1: 'CCBC-13',
        2: 'CCBC-14',
        3: 'asteroid',
        4: 'CCBC-1314',
    }
    path_area = path_area_dict[problem['pgid']]
    return path_area

def convert_problem(problem):
    path_area = get_path_area(problem)

    image_path = os.path.join(BASE_DIR, 'images', path_area)

    content = {}
    content['type'] = 'problem'
    content['title'] = "%s" % (problem['title'],)
    content['extend-data'] = problem['extend_data']
    content['content-type'] = problem['type'] # 0: image, 1: html 2: vue-sfc

    content['content'] = []
    if problem['content']:
        parsed_content = get_download_images(problem['content'], image_path)
        content['content'].append(parsed_content)

    if problem['type'] != 2:
        if problem['html']:
            parsed_html = get_download_images(problem['html'], image_path)
            content['content'].append(parsed_html)
    else:
        if problem['html']:
            parsed_html = get_download_images(problem['html'], image_path)
            content['vue_template'] = parsed_html
        if problem['script']:
            parsed_vue_script = get_download_images(problem['script'], image_path)
            content['vue_script'] = parsed_vue_script

    if problem['extend_content']:
        content['extend-content'] = []
        parsed_extend_content = get_download_images(problem['extend_content'], image_path)
        content['extend-content'].append(parsed_extend_content)

    if problem['image']:
        local_url = download_image(problem['image'], image_path)
        content['problem-image'] = local_url

    content['answer'] = problem['answer']
    content['desc'] = problem['desc']
    
    # 插入提示
    puzzle_tips = read_from_db('select * from `puzzle_tips` where `pid` = %s order by `order` asc' % problem['pid'])

    if puzzle_tips and len(puzzle_tips) > 0:
        puzzle_tips_list = []
        for tip_row in puzzle_tips:
            puzzle_tip = parse_puzzle_tips(tip_row)
            parse_tip_content = get_download_images(puzzle_tip['content'], image_path)
            puzzle_tips_list.append({
                'title': puzzle_tip['title'],
                'content': parse_tip_content,
            })
        
        content['tips'] = puzzle_tips_list

    # 插入里程碑
    additional_answers = read_from_db('select * from `additional_answer` where `pid` = %s' % problem['pid'])

    if additional_answers and len(additional_answers) > 0:
        additional_answers_list = []
        for answer_row in additional_answers:
            additional_answer = parse_additional_answers(answer_row)
            additional_answers_list.append({
                'answer': additional_answer['answer'],
                'message': additional_answer['message'],
                'extra': additional_answer['extra'],
            })
        
        content['additional-answers'] = additional_answers_list
    
    if problem['analysis']:
        parse_analysis = get_download_images(problem['analysis'], image_path)
        content['answer-analysis'] = parse_analysis

    # 插入链接
    content['links'] = []
    content['links'].append({'title': '索引页', 'type': 'index', 'path': 'ccbc13/index'})
    if problem['pgid'] == 1:
        content['links'].append({'title': 'CCBC-13', 'type': 'page', 'path': 'ccbc13/pages/ccbc13'})
    elif problem['pgid'] == 2:
        content['links'].append({'title': 'CCBC-14', 'type': 'page', 'path': 'ccbc13/pages/ccbc14'})
    elif problem['pgid'] == 3:
        content['links'].append({'title': '小行星', 'type': 'page', 'path': 'ccbc13/pages/asteroid'})
    elif problem['pgid'] == 4:
        content['links'].append({'title': 'CCBC-1314', 'type': 'page', 'path': 'ccbc13/pages/ccbc1314'})

    return content

def start():
    # 读取数据库
    data = read_from_db('select * from puzzle')
    # 写入文件
    for row in data:
        problem = parse_problem(row)
        print("Processing problem %s %s" % (problem['pid'], problem['title']))
        problem_doc = convert_problem(problem)

        path_area = get_path_area(problem)
        problem_path = os.path.join(BASE_DIR, 'problems', path_area)
        if not os.path.exists(problem_path):
            os.makedirs(problem_path)

        file_name = "%s" % problem['pid']
        
        problem_file = os.path.join(problem_path, "%s.yaml" % file_name)

        with open(problem_file, 'w', encoding='utf8') as f:
            yaml.dump(problem_doc, f, allow_unicode=True)

if __name__ == '__main__':
    start()