using Bliss.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace Bliss.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SupportTicketController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly ILogger<SupportTicketController> _logger;

        public SupportTicketController(MyDbContext context, ILogger<SupportTicketController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<SupportTicket>), StatusCodes.Status200OK)]
        public IActionResult GetAll()
        {
            try
            {
                var tickets = _context.SupportTickets.ToList();
                return Ok(tickets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when getting all support tickets");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(SupportTicket), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult GetTicket(int id)
        {
            try
            {
                var ticket = _context.SupportTickets.Find(id);
                if (ticket == null)
                {
                    return NotFound();
                }
                return Ok(ticket);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when getting support ticket by id");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost, Authorize]
        [ProducesResponseType(typeof(SupportTicket), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult CreateTicket(SupportTicket ticket)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdString, out var userId))
                {
                    return Unauthorized("Invalid user identifier.");
                }

                ticket.CreatedBy = userId;
                ticket.Status = TicketStatus.Unassigned;
                ticket.Priority = PriorityLevel.Low;
                ticket.StartDate = DateTime.Now;

                _context.SupportTickets.Add(ticket);
                _context.SaveChanges();

                return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticket);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when creating support ticket");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(SupportTicket), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult UpdateTicket(int id, SupportTicket updatedTicket)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var ticket = _context.SupportTickets.Find(id);
                if (ticket == null)
                {
                    return NotFound();
                }

                ticket.AssignedTo = updatedTicket.AssignedTo;
                ticket.Type = updatedTicket.Type;
                ticket.Title = updatedTicket.Title;
                ticket.Description = updatedTicket.Description;
                ticket.Priority = updatedTicket.Priority;
                ticket.Status = updatedTicket.Status;
                ticket.EndDate = updatedTicket.EndDate;

                // Check if the EndDate has been met and is one year after the StartDate
                if (ticket.EndDate.HasValue && ticket.EndDate.Value >= ticket.StartDate.AddYears(1))
                {
                    var user = _context.Users.Find(ticket.CreatedBy);
                }

                _context.SaveChanges();

                return Ok(ticket);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when updating support ticket");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}"), Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult DeleteTicket(int id)
        {
            try
            {
                var ticket = _context.SupportTickets.Find(id);
                if (ticket == null)
                {
                    return NotFound();
                }

                _context.SupportTickets.Remove(ticket);
                _context.SaveChanges();
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when deleting support ticket");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
