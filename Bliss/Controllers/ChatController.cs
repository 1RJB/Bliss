using BlissAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace BlissAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly ILogger<ChatController> _logger;

        public ChatController(MyDbContext context, ILogger<ChatController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Chat>), StatusCodes.Status200OK)]
        public IActionResult GetAll()
        {
            try
            {
                var chats = _context.Chats.ToList();
                return Ok(chats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when getting all chats");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Chat), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult GetChat(int id)
        {
            try
            {
                var chat = _context.Chats.Find(id);
                if (chat == null)
                {
                    return NotFound();
                }
                return Ok(chat);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when getting chat by id");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost, Authorize]
        [ProducesResponseType(typeof(Chat), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult CreateChat(Chat chat)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdStr, out var userId))
                {
                    return Unauthorized("User ID is invalid.");
                }

                var supportTicket = _context.SupportTickets.Find(chat.SupportTicketId);

                if (supportTicket == null || (supportTicket.AssignedTo != userId && supportTicket.CreatedBy != userId))
                {
                    return Forbid();
                }

                chat.TimeStamp = DateTime.Now;
                _context.Chats.Add(chat);
                _context.SaveChanges();

                return CreatedAtAction(nameof(GetChat), new { id = chat.Id }, chat);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when creating chat");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}"), Authorize]
        [ProducesResponseType(typeof(Chat), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult UpdateChat(int id, Chat updatedChat)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var chat = _context.Chats.Find(id);
                if (chat == null)
                {
                    return NotFound();
                }

                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdStr, out var userId))
                {
                    return Unauthorized("User ID is invalid.");
                }

                var supportTicket = _context.SupportTickets.Find(chat.SupportTicketId);

                if (supportTicket == null || (supportTicket.AssignedTo != userId && supportTicket.CreatedBy != userId))
                {
                    return Forbid();
                }

                chat.Message = updatedChat.Message;
                chat.Status = updatedChat.Status;
                chat.ResolvedDescription = updatedChat.ResolvedDescription;

                _context.SaveChanges();

                return Ok(chat);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when updating chat");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}"), Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult DeleteChat(int id)
        {
            try
            {
                var chat = _context.Chats.Find(id);
                if (chat == null)
                {
                    return NotFound();
                }

                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdStr, out var userId))
                {
                    return Unauthorized("User ID is invalid.");
                }

                var supportTicket = _context.SupportTickets.Find(chat.SupportTicketId);

                if (supportTicket == null || (supportTicket.AssignedTo != userId && supportTicket.CreatedBy != userId))
                {
                    return Forbid();
                }

                _context.Chats.Remove(chat);
                _context.SaveChanges();
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when deleting chat");
                return StatusCode(500, "Internal server error");
            }
        }

    }
}
