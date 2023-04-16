import os
import re
import yaml
import pymysql
import requests
from mysql_const import MYSQL_CONST

BASE_DIR = 'D:\workspace\ccbc12\CCBCArchive\public\ccbc12'

def read_from_db():
    # 连接数据库
    dbconn = pymysql.connect(host=MYSQL_CONST['host'],
                             port=MYSQL_CONST['post'],
                             user=MYSQL_CONST['user'],
                             password=MYSQL_CONST['pass'],
                             db=MYSQL_CONST['db'], charset='utf8')
    
    cursor = dbconn.cursor()

    # 读取数据
    sql = 'select * from puzzle'
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
    problem['tips1'] = row[12]
    problem['tips2'] = row[13]
    problem['tips3'] = row[14]
    problem['tips1title'] = row[15]
    problem['tips2title'] = row[16]
    problem['tips3title'] = row[17]
    problem['second_key'] = row[18]

    return problem

def download_image(image_url, image_path):
    # 下载图片到本地
    if not os.path.exists(image_path):
        os.makedirs(image_path)
    image_name = image_url.split('/')[-1]
    local_url = "/ccbc12/images/%s/%s" % (image_path.split('\\')[-1], image_name)

    local_path = os.path.join(image_path, image_name)

    print("Downloading image %s" % image_url)
    #使用requests库下载图片
    response = requests.get(image_url)
    with open(local_path, 'wb') as f:
        f.write(response.content)
    return local_url

def get_download_images(content, image_path):
    # 提取所有 https://static.cipherpuzzles.com/static/...webp 的图片链接
    image_urls = re.findall(r'https://static.cipherpuzzles.com/static/.*?webp', content)
    for image_url in image_urls:
        # 下载图片到本地
        local_url = download_image(image_url, image_path)
        # 替换图片链接为本地链接
        content = content.replace(image_url, local_url)
    return content

def get_path_area(problem):
    path_area_dict = {
        1: 'a',
        2: 'b',
        3: 'c',
        4: 'd',
        5: 'e',
        6: 'f',
    }
    if problem['pgid'] >= 7:
        path_area = "extra"
    else:
        path_area = path_area_dict[problem['pgid']]
    
    return path_area

def convert_problem(problem):
    path_area = get_path_area(problem)

    image_path = os.path.join(BASE_DIR, 'images', path_area)

    content = {}
    content['type'] = 'problem'

    year_key = problem['second_key']
    if year_key > 10000:
        content['title'] = "%s - CCBC 13" % (problem['title'],)
    else:
        content['title'] = "#%s %s - CCBC 12" % (problem['second_key'], problem['title'])
    content['content'] = []
    parsed_content = get_download_images(problem['content'], image_path)
    content['content'].append(parsed_content)
    if problem['html']:
        parsed_html = get_download_images(problem['html'], image_path)
        content['content'].append(parsed_html)

    if problem['extend_content']:
        content['extend_content'] = []
        content['extend_content'].append(problem['extend_content'])

    if problem['image']:
        local_url = download_image(problem['image'], image_path)
        content['problem_image'] = local_url

    content['answer'] = problem['answer']
    
    content['tips'] = []
    if problem['tips1']:
        content['tips'].append({'title': problem['tips1title'], 'content': problem['tips1']})
    if problem['tips2']:
        content['tips'].append({'title': problem['tips2title'], 'content': problem['tips2']})
    if problem['tips3']:
        content['tips'].append({'title': problem['tips3title'], 'content': problem['tips3']})
    
    content['answer_analysis'] = ''
    content['links'] = []
    content['links'].append({'title': 'CCBC12 索引页', 'type': 'index', 'path': 'ccbc12/index'})
    content['links'].append({'title': '时光机', 'type': 'page', 'path': 'ccbc12/pages/main'})

    return content

def start():
    # 读取数据库
    data = read_from_db()
    # 写入文件
    for row in data:
        problem = parse_problem(row)
        print("Processing problem %s %s" % (problem['second_key'], problem['title']))
        problem_doc = convert_problem(problem)

        path_area = get_path_area(problem)
        problem_path = os.path.join(BASE_DIR, 'problems', path_area)
        if not os.path.exists(problem_path):
            os.makedirs(problem_path)

        if (problem['second_key'] > 10000):
            file_name = "meta%s" % path_area
        else:
            file_name = "p%s" % problem['second_key']
        
        problem_file = os.path.join(problem_path, "%s.yaml" % file_name)

        with open(problem_file, 'w', encoding='utf8') as f:
            yaml.dump(problem_doc, f, allow_unicode=True)

if __name__ == '__main__':
    start()